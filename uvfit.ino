// This #include statement was automatically added by the Particle IDE.
//#include <Adafruit_LIS3DH.h>

// This #include statement was automatically added by the Particle IDE.
#include "Asset_Tracker_2.h"

// This #include statement was automatically added by the Particle IDE.
#include "Adafruit_GPS_2.h"

// This #include statement was automatically added by the Particle IDE.
#include "ActivityReporter.h"

// This #include statement was automatically added by the Particle IDE.
#include "ActivityDetector.h"


//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------
// Define starting vars:

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
unsigned long lastSync = millis();
int led = D7; // On/off blue only LED
int redColor = 0;
int greenColor = 0;
int blueColor = 0;
int oldRed = 0; // For resetting the LED color after the photon has been stopped.
int oldGreen = 0;
int oldBlue = 0;
int count = 0;
int button = BTN;
int uvThresh = 0;
String activityType("walking");
std::string empty("");
bool executeStateMachines = false;
int buttonDebounceDelay = 400; // in ms
int gpsTestTime=500; // in ms.
 
//-------------------------------------------------------------------
// Define helper devices:

AssetTracker gpsSensor = AssetTracker();
Adafruit_VEML6070 uvSensor = Adafruit_VEML6070();

//-------------------------------------------------------------------
// Instantiate classes
Timer stateMachineTimer(10, stateMachineScheduler);
ActivityDetector activityDetector(gpsSensor, 2, 100, 10000.0);
ActivityReporter activityReporter(gpsSensor, uvSensor, activityDetector);

// Set up the state machine:
void stateMachineScheduler() 
{
    executeStateMachines  = true;
}

// Handles pings from the UVFit app. The app sends
// the activity type and UV threshold to the photon
int pingHandler(String data)
{
    std::string incoming(data);
    if(incoming != empty)
    {
        activityReporter.incrementActivityID();
        if(activityDetector.amIStopped())
        {
            if(incoming.find("running") != std::string::npos)
            {
                activityType = "running";
                oldRed = 0;
                oldGreen = 191;
                oldBlue = 255;
            
            }
            else if (incoming.find("biking") != std::string::npos)
            {
                activityType = "biking";
                oldRed = 0;
                oldGreen = 128;
                oldBlue = 0;
            }
           else
           {
               activityType = "walking";
               oldRed = 0;
               oldGreen = 0;
               oldBlue = 255;
            }
            
        } else {
            
            if(incoming.find("running") != std::string::npos)
            {
                activityType = "running";
                redColor = 0;
                greenColor = 191;
                blueColor = 255;
            }
            else if (incoming.find("biking") != std::string::npos)
            {
                activityType = "biking";
                redColor = 0;
                greenColor = 128;
                blueColor = 0;
            }
            else
            {
                activityType = "walking";
                redColor = 0;
                greenColor = 0;
                blueColor = 255;
             }
        }
        
        
        Serial.println(activityType);
        
        std::size_t foundAt = incoming.find("uvThresh:");//std::string(data.substr("uvThresh:"));
        std::string threshStart = incoming.substr(foundAt+9);
        uvThresh = atoi(threshStart.c_str());
        activityReporter.setUvThresh(uvThresh);
        activityReporter.resetUvSum();
       // Serial.println(uvThresh);
        
    } else {
        Serial.println("PHOTON PINGED BUT NO DATA RECEIVED!");
    }

    return 0;
}


void myHandler(const char* event, const char* data) {
    // Format output
    String output = String::format("POST Response:\n %s\n %s\n", event, data);
    // Log to serial console. 
    Serial.println(output);
    // Publish to web console.
    Particle.publish("gps", data, PRIVATE);
    
}

//-------------------------------------------------------------------

void setup() {
    Serial.begin(9600);

    // Declare function for ping handling
    Particle.function("settingDev", pingHandler);
    // Initialize the gps and turn it on    
    gpsSensor.begin();
    gpsSensor.gpsOn();
    
    // Turn on the UV sensor.
    uvSensor.begin(VEML6070_1_T);
    
    // Setup pin mode for button
    pinMode(button, INPUT);
    // LED on pin 7, flashes blue
    pinMode(led, OUTPUT);
    
    // Handler for response from POSTing location to server
    Particle.subscribe("hook-response/gps", myHandler, MY_DEVICES);
    Particle.subscribe("hook-response/uvfit", myHandler, MY_DEVICES);

    
    stateMachineTimer.start();
}    

//-------------------------------------------------------------------

void loop() {
  if(millis() - lastSync > ONE_DAY_MILLIS) 
  {
    Particle.syncTime();
    lastSync = millis();
  }
  
    RGB.control(true);
    RGB.color(redColor, greenColor, blueColor); 
  //  delay(100);
  
  // If the button is pressed, STOP EVERYTHING until it's pushed again
  if(digitalRead(button) == 0)
  {
      Serial.println("Hit button.");
      if(activityDetector.amIStopped()) //If already stopped, restart.
      {
          activityDetector.carryOn();
          activityReporter.incrementActivityID();
        //  executeStateMachines = true;
          Serial.println("Already stopped, starting up again.");
          delay(0.75*buttonDebounceDelay); // Delay long enough so one press doesn't trigger multiple events.
          redColor = oldRed;
          greenColor = oldGreen;
          blueColor = oldBlue;
      } else { // Otherwise, stop everything.
          activityDetector.stopEverything();
          executeStateMachines=false;
          Serial.println("STOOOOOOP!!!");
          delay(buttonDebounceDelay);
          // Saving the old colors for when the photon is restarted,
          // and setting the current color to 'off', ie, yellow.
          oldRed = redColor;
          oldGreen = greenColor;
          oldBlue = blueColor;
          redColor = 255;
          greenColor = 255;
          blueColor = 0;
      }
  }
  
  
  if(executeStateMachines and !activityDetector.amIStopped())
  {
      // Receive GPS data
      gpsSensor.updateGPS();
      // Detect whether we are moving
      if(activityDetector.execute()) // Returns true if user still for too long.
      {
          oldRed = redColor;
          oldGreen = greenColor;
          oldBlue = blueColor;
          redColor = 255;
          greenColor = 255;
          blueColor = 0;
      }
      // Post results:
      if(activityReporter.execute()) // Returns true if we've hit the UV thresh set by the user.
      {
          oldRed = redColor;
          oldGreen = greenColor;
          oldBlue = blueColor;
          redColor = 255;
          greenColor = 105;
          blueColor = 180;
      }
      // Wait until next call.
      executeStateMachines=false;
  }
}


//-------------------------------------------------------------------

