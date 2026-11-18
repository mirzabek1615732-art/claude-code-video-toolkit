"""Manual mode of the instagram-insights plugin: supplied metrics are used as given, never invented."""

import csv
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = (Path(__file__).resolve().parents[2]
          / "plugins/instagram-insights/skills/instagram-analysis/scripts/ig.py")
spec = importlib.util.spec_from_file_location("ig", SCRIPT)
ig = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ig)


class ParseTests(unittest.TestCase):
    def test_counts(self):
        self.assertEqual(ig.parse_count("1,234"), (1234, False))
        self.assertEqual(ig.parse_count("1.2K"), (1200, True))
        self.assertEqual(ig.parse_count("1,2K"), (1200, True))
        self.assertEqual(ig.parse_count("3M"), (3000000, True))
        self.assertEqual(ig.parse_count(""), (None, False))
        self.assertEqual(ig.parse_count("—"), (None, False))
        for bad in ("lots", "12 views", "-5"):
            with self.assertRaises(ValueError):
                ig.parse_count(bad)

    def test_seconds(self):
        self.assertEqual(ig.parse_seconds("7 sec", False), 7.0)
        self.assertEqual(ig.parse_seconds("7.4s", False), 7.4)
        self.assertEqual(ig.parse_seconds("1m 5s", False), 65.0)
        self.assertEqual(ig.parse_seconds("0:07", False), 7.0)
        self.assertEqual(ig.parse_seconds("7", True), 7.0)
        with self.assertRaises(ValueError):  # unit unknown: refuse rather than assume
            ig.parse_seconds("7", False)

    def test_dates(self):
        self.assertEqual(ig.parse_posted("2026-10-03 18:30", "mdy"), ("2026-10-03T18:30:00", True))
        self.assertEqual(ig.parse_posted("2026-10-03", "mdy"), ("2026-10-03T00:00:00", False))
        self.assertEqual(ig.parse_posted("10/03/2026 14:05", "mdy")[0], "2026-10-03T14:05:00")
        self.assertEqual(ig.parse_posted("10/03/2026 14:05", "dmy")[0], "2026-03-10T14:05:00")
        with self.assertRaises(ValueError):
            ig.parse_posted("yesterday", "mdy")


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "needs ffmpeg")
class ManualFlowTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.reels = self.tmp / "reels"
        self.reels.mkdir()
        for name, dur in (("a.mp4", 3), ("b.mp4", 4), ("c.mov", 2)):
            subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", f"testsrc2=s=180x320:d={dur}",
                            "-f", "lavfi", "-i", f"sine=d={dur}", "-shortest", "-y", str(self.reels / name)],
                           check=True)
        self.env = {k: v for k, v in os.environ.items() if k != "INSTAGRAM_ACCESS_TOKEN"}

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def ig(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), "--data", str(self.tmp / "data"), *args],
                              cwd=self.tmp, env=self.env, capture_output=True, text=True)

    def write_metrics(self, rows):
        path = self.tmp / "metrics.csv"
        with open(path, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["file", "posted", "views", "reach", "likes", "comments", "saves", "shares",
                        "avg_watch_s", "source"])
            w.writerows(rows)
        return path

    def test_init_lists_every_video(self):
        r = self.ig("manual", "init", "--videos", str(self.reels))
        self.assertEqual(r.returncode, 0, r.stderr)
        with open(self.tmp / "data" / "metrics.csv") as f:
            self.assertEqual(sorted(row["file"] for row in csv.DictReader(f)), ["a.mp4", "b.mp4", "c.mov"])

    def test_missing_values_stay_missing(self):
        m = self.write_metrics([
            ["a.mp4", "2026-10-01 18:00", "1,000", "800", "40", "4", "6", "2", "2.5 sec", "shot1.png"],
            ["b", "2026-10-02", "1.5K", "", "30", "", "", "", "", "shot2.png"],
        ])
        r = self.ig("manual", "import", "--videos", str(self.reels), "--metrics", str(m))
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("c.mov: no metrics row", r.stderr)
        self.assertEqual(self.ig("analyze").returncode, 0)
        r = self.ig("report", "--by", "views", "--json")
        self.assertEqual(r.returncode, 0, r.stderr)
        rep = json.loads(r.stdout)
        rows = {x["file_name"]: x for x in rep["ranking"]}
        self.assertEqual(rows["a.mp4"]["engagement_rate"], round(52 / 800, 4))
        b = rows["b.mp4"]
        self.assertEqual(b["views"], 1500)
        self.assertEqual(b["approx"], ["views"])
        for key in ("reach", "engagement_rate", "save_rate", "avg_watch_s", "watch_ratio", "hour_local"):
            self.assertIsNone(b.get(key), key)  # nothing filled in for what wasn't supplied
        self.assertEqual(rep["not_ranked"], ["c"])
        self.assertEqual(rep["coverage"]["reach"], 1)
        md = (self.tmp / "data" / "report.md").read_text()
        self.assertIn("≈1500", md)
        self.assertIn("missing", md)
        self.assertIn("Not ranked", md)

    def test_bad_values_import_nothing(self):
        m = self.write_metrics([["a.mp4", "yesterday", "lots", "", "", "", "", "", "7", "x.png"]])
        r = self.ig("manual", "import", "--videos", str(self.reels), "--metrics", str(m))
        self.assertEqual(r.returncode, 1)
        self.assertIn("Nothing was imported", r.stderr)
        self.assertFalse((self.tmp / "data" / "media.json").exists())

    def test_one_video_two_rows_refused(self):
        m = self.write_metrics([["a.mp4", "", "10", "", "", "", "", "", "", "s"],
                                ["a", "", "20", "", "", "", "", "", "", "s"]])
        r = self.ig("manual", "import", "--videos", str(self.reels), "--metrics", str(m))
        self.assertEqual(r.returncode, 1)
        self.assertIn("already used by row 2", r.stderr)


if __name__ == "__main__":
    unittest.main()
