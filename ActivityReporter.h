#ifndef ACTIVITY_REPORTER_H
#define ACTIVITY_REPORTER_H

//-------------------------------------------------------------------

#include "Asset_Tracker_2.h""
#include "ActivityDetector.h"
#include <Adafruit_VEML6070.h>

//-------------------------------------------------------------------

class ActivityReporter {
   enum State { S_Wait, S_Publish, S_LedNotify };

private:
    int rate;
    int activityID;

private:
    State state;
    int tick;
    int led;
    int uvThresh;
    uint16_t curUvSum;
    AssetTracker& gpsSensor;
    Adafruit_VEML6070& uvSensor;
    ActivityDetector& activityDetector;

public:
    ActivityReporter(AssetTracker &theTracker, Adafruit_VEML6070& uvSensor, ActivityDetector &theDetector);    
    bool execute();
    inline void setUvThresh(int thresh) { uvThresh = thresh; };
    void resetUvSum();
    void incrementActivityID();
};

//-------------------------------------------------------------------

#endif