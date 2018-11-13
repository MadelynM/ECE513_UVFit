// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_VEML6070.h>

// This #include statement was automatically added by the Particle IDE.
#include <AssetTracker.h>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
unsigned long lastSync = millis();

//-------------------------------------------------------------------

bool executeStateMachines = false;
 
//-------------------------------------------------------------------

AssetTracker gpsSensor = AssetTracker();

Adafruit_VEML6070 uvSens = Adafruit_VEML6070();
//PotholeDetector potholeDetector(locationTracker, 2, 10, 10000.0);
//PotholeReporter potholeReporter(locationTracker, potholeDetector);


int button = BTN;
float counter= 0;
//-------------------------------------------------------------------

void setup() {
    Serial.begin(9600);

    // Initialize the gps and turn it on    
    gpsSensor.begin();
    gpsSensor.gpsOn();
    
    // Turn on the UV sensor.
    uvSens.begin(VEML6070_1_T);
    
    // Setup pin mode for button
    pinMode(button, INPUT);
    
    // Handler for response from POSTing location to server
  //  Particle.subscribe("hook-response/holz", responseHandler, MY_DEVICES);
   Particle.subscribe("hook-response/uvfit", myHandler, MY_DEVICES);

    
  //  stateMachineTimer.start();
}    

//-------------------------------------------------------------------

void loop() {


    if (digitalRead(button) == 0) {
        counter = counter + 2;
        gpsSensor.updateGPS();

        float fakedSpeed = 0 + counter;
        
        String data = String::format("{ \"speed\": %f, \"latitude\": %f, \"longitude\": %f, \"uvLevel\": %d }", 
                                           fakedSpeed, gpsSensor.readLatDeg(), gpsSensor.readLonDeg(), uvSens.readUV());
                                         // CORRECT VALUES: gpsSensor.getSpeed(), gpsSensor.readLonDeg(), gpsSensor.readLatDeg(), uvSens.readUV());
                                         
        String accuracy = String(gpsSensor.getGpsAccuracy());
        String numSat = String(gpsSensor.getSatellites());
        String qual = String(gpsSensor.getFixQuality());
        
        String debug = String("Acc: " + accuracy + " numSat: "+ numSat + " FixQual: " + qual);
        
        
        // Log to serial console
        Serial.println(data);
        Serial.println(debug);

        // Publish to web console.
        Particle.publish("gps", data, PRIVATE);

    }
    delay(250);
}

// When obtain response from the publish
void myHandler(const char *event, const char *data) {
  // Formatting output
  String output = String::format("Response from Post:\n  %s\n", data);
  // Log to serial console
  Serial.println(output);
}


//-------------------------------------------------------------------

