import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
// x264 with a high quality setting for social upload
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
