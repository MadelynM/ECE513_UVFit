#ifndef ACTIVITY_DETECTOR_H
#define ACTIVITY_DETECTOR_H

#include <vector>
#include "Asset_Tracker_2.h"
#include <time.h>
//#include <Adafruit_VEML6070.h>

using namespace std;

class ActivityDetector {
  enum State { S_Wait, S_Sample, S_Filter, S_Detected, S_WaitUntilReported, S_StopEverything };
  
  private:
    int rate;
    int samples;
    float threshold;
    int numZerosInARow; // How may samples have been zeros- ie, not moving.
    int numSecondsRunning;
    
    int tick;
    int numSamp;
    State curState;
    
    vector<int> accelSamples;
    int sampleIndex;
    bool activityDetected;
    float avgMagnitude;
    float dummyAccelMag;
    AssetTracker& accelSensor;
    
  public:
    ActivityDetector(AssetTracker& theTracker, int rate, int samples, float threshold);
    bool isDetected();
    void setReported();
    bool execute();
    bool amIStopped();
    void stopEverything();
    void carryOn();
};

#endif