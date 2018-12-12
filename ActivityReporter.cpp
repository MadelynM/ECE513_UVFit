//-------------------------------------------------------------------

#include "ActivityReporter.h"

//-------------------------------------------------------------------

//#define DEBUG

//-------------------------------------------------------------------

ActivityReporter::ActivityReporter(AssetTracker &theTracker, 
                                   Adafruit_VEML6070 &theSensor,
                                   ActivityDetector &theDetector) :
    gpsSensor(theTracker), 
    uvSensor(theSensor),
    activityDetector(theDetector)
{    
        
    tick = 0;
    state = S_Wait;
    led = D7; 
    pinMode(led, OUTPUT);
    uvThresh = 10000000;
    curUvSum = 0;
    activityID = 0;
}

//------------------------------------------------------------------
void ActivityReporter::resetUvSum()
{
    curUvSum = 0;
}

void ActivityReporter::incrementActivityID()
{
    ++activityID;
}

//-------------------------------------------------------------------

bool ActivityReporter::execute() {
    bool hitUvThresh = false;
    String postData;

 //   Serial.println(state);

    switch (state) {
        case ActivityReporter::S_Wait:
            tick = 0;
            digitalWrite(led, LOW);
            
            if (activityDetector.isDetected()) {
                state = ActivityReporter::S_Publish;
            }
            else {
                state = ActivityReporter::S_Wait;
            }
            break;

        case ActivityReporter::S_Publish:
            if (gpsSensor.gpsFix()) {

                postData = String::format("{ \"activityId\":\"%d\", \"speed\": \"%f\", \"latitude\": \"%f\", \"longitude\": \"%f\", \"uvLevel\": \"%d\" }", 
                                             activityID, gpsSensor.getSpeed(), gpsSensor.readLatDeg(), gpsSensor.readLonDeg(), uvSensor.readUV());
                uint16_t numToAdd = uvSensor.readUV()/100;
                
               
                curUvSum += uvSensor.readUV();
                if(curUvSum >= uvThresh)
                {
                    hitUvThresh = true;
                }
            }

            Serial.println(postData);
            Particle.publish("gps", postData);
            activityDetector.setReported();
            
            state = ActivityReporter::S_LedNotify;
            break;

        case ActivityReporter::S_LedNotify:
            ++tick;
            if (tick == 20) {
                state = ActivityReporter::S_Wait;
            }
            else {
                state = ActivityReporter::S_LedNotify;
            }
            break;
    }
    
    return hitUvThresh;
}

//-------------------------------------------------------------------


