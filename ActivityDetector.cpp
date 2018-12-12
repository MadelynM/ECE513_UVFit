#include "ActivityDetector.h"

ActivityDetector::ActivityDetector(AssetTracker& theTracker, 
                                   int rate,
                                   int samples,
                                   float threshold):
  accelSensor(theTracker),
  accelSamples(samples)
{
                this->rate = rate;
                this->samples = samples;
                this->threshold = threshold;
                tick=0;
                sampleIndex = 0;
                activityDetected = false;
                this->curState = S_StopEverything; //S_Wait;
                numZerosInARow=0;
                dummyAccelMag = 9000;
                numSecondsRunning = 0;
}

bool ActivityDetector::amIStopped()
{
    if(this->curState== S_StopEverything)
    { return true;}
    return false;
}

void ActivityDetector::carryOn()
{ this->curState = S_Wait; }

void ActivityDetector::stopEverything()
{ this->curState = S_StopEverything; }

bool ActivityDetector::execute() 
{
    bool stopped = false;
     switch (this->curState) 
     {
        case ActivityDetector::S_Wait:
            ++tick;
            sampleIndex = 0;

            if (tick == this->rate) {
                this->curState = ActivityDetector::S_Sample;
            }
            else {
                this->curState = ActivityDetector::S_Wait;
            }
            break;

        case ActivityDetector::S_Sample:
            tick = 0;
            accelSamples.at(sampleIndex) = accelSensor.readXYZmagnitude(); 
            // Accelerometer broken, so using mock data
//             dummyAccelMag += 100;
//             if(dummyAccelMag >= 15000)
//             {
//                 float rInc = (rand() %200) -100;
//                 dummyAccelMag += rInc;
//             }
//             accelSamples.at(sampleIndex) = dummyAccelMag;

            sampleIndex++;
            
            if (sampleIndex == samples) {
                this->curState = ActivityDetector::S_Filter;
            }
            else {
                this->curState = ActivityDetector::S_Sample;
            }
            break;

        case ActivityDetector::S_Filter:
            ++numSecondsRunning;
            Serial.println(String(numSecondsRunning));
            avgMagnitude = 0.0;
            for (int i = 0; i < samples; ++i) {
                avgMagnitude += static_cast<float>(accelSamples.at(i));
            }
            avgMagnitude = avgMagnitude / samples;
            
            if(numSecondsRunning > 10 and numSecondsRunning < 15)
            {
                avgMagnitude = 0.0;
            }

            if (avgMagnitude > threshold) {
                this->curState = ActivityDetector::S_Detected;
            }
            else {
                this->curState = ActivityDetector::S_Wait;
                ++numZerosInARow;
            }
            if(numZerosInARow>=3)
            {
                this->curState = ActivityDetector::S_StopEverything;
                numZerosInARow = 0;
                stopped = true;
            }
            break;

        case ActivityDetector::S_Detected:
            activityDetected = true;
            this->curState = ActivityDetector::S_WaitUntilReported;
            numZerosInARow = 0;
            break;

        case ActivityDetector::S_WaitUntilReported:
            if (activityDetected == true) {
                this->curState = ActivityDetector::S_WaitUntilReported;
            }
            else {
                this->curState = ActivityDetector::S_Wait;
            }
            break;
    }
 return stopped;
    
}
//-------------------------------------------------------------------

bool ActivityDetector::isDetected() {
    return activityDetected;
}

//-------------------------------------------------------------------

void ActivityDetector::setReported() {
    activityDetected = false;
}