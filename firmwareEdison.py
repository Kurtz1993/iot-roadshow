

import time, sys, signal, atexit
import paho.mqtt.client as mqtt
import mraa
#Lib for UV Sensor
import pyupm_guvas12d as upmUV
#Lib for Temp Sensor
import pyupm_grove as upmTemp
#Statys Led Variables
##Set up gpio
led2 = 2
led3 = 3
led4 = 4
led5= 5
led6 = 6
led7 = 7
led8 = 8
led9= 9
led10= 10
led11= 11
led12 = 12
led2 = mraa.Gpio(2)
led3 = mraa.Gpio(3)
led4 = mraa.Gpio(4)
led5 = mraa.Gpio(5)
led6 = mraa.Gpio(6)
led7 = mraa.Gpio(7)
led8 = mraa.Gpio(8)
led9 = mraa.Gpio(9)
led10 = mraa.Gpio(10)
led11 = mraa.Gpio(11)
led12 = mraa.Gpio(12)
led13 = mraa.Gpio(13)
led2.dir(mraa.DIR_OUT)
led3.dir(mraa.DIR_OUT)
led4.dir(mraa.DIR_OUT)
led5.dir(mraa.DIR_OUT)
led6.dir(mraa.DIR_OUT)
led7.dir(mraa.DIR_OUT)
led8.dir(mraa.DIR_OUT)
led9.dir(mraa.DIR_OUT)
led10.dir(mraa.DIR_OUT)
led11.dir(mraa.DIR_OUT)
led12.dir(mraa.DIR_OUT)
led13.dir(mraa.DIR_OUT)
#Init sensors
myUVSensor = upmUV.GUVAS12D(0);
temp = upmTemp.GroveTemp(1)
#Operating voltage for UV sensor
GUVAS12D_AREF = 5.0;
SAMPLES_PER_QUERY = 1024;

#Handler for error exit
def SIGINTHandler(signum, frame):
	raise SystemExit

#Handler for ctrl+c
def exitHandler():
	led2.write(1)
	led3.write(1)
	led4.write(1)
	led5.write(1)
	led6.write(1)
	led7.write(1)
	led8.write(1)
	led9.write(1)
	led10.write(1)
	led11.write(1)
	led12.write(1)
	print "Exiting"
	sys.exit(0)

#Init our Handlers
atexit.register(exitHandler)
signal.signal(signal.SIGINT, SIGINTHandler)
##Init MQTT
def on_connect(client, userdata, rc):
        print("Connected with result code "+str(rc))
        client.subscribe("/test")

def on_message(client, userdata, msg):
        print(msg.topic+" "+str(msg.payload))

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect("mswmqtt.cloudapp.net", 8080, 60)
##MQTT
while(1):
	#Read of temp sensor
	celsius = temp.value()
	#Read of UV sensor
	s = myUVSensor.value(GUVAS12D_AREF, SAMPLES_PER_QUERY)
	s = s * 1000
	s= s/200
	print s
	##Publish to brokers
	client.publish("/uv", s)
	client.publish("/temp", celsius)
	#Turn on GreenLED if UV is OK
	if (s<2): 
		led2.write(1)
		led3.write(1)
	#Turn on RedLed if UV its not OK
	#You can set your owns
	elif (s>2 and s < 5):
		led2.write(1)
		led3.write(1)
		led4.write(1)
		led5.write(1)
		led6.write(1)
		led7.write(1)
	elif (s>5):
		led2.write(1)
		led3.write(1)
		led4.write(1)
		led5.write(1)
		led6.write(1)
		led7.write(1)
		led8.write(1)
		led9.write(1)
		led10.write(1)
		led11.write(1)
		led12.write(1)
		led13.write(1)
	#Print temp
	print celsius
	time.sleep(1)