import { defineStore } from 'pinia';

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    weatherData: {
      hourly: {
        time: new Date(),
        temperature2m: 0,
        relativeHumidity2m: 0,
        precipitationProbability: 0,
        precipitation: 0,
      }
    }
  }),
  actions: {
    async fetchWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation`;
          const response = await fetch(url);
          const data = await response.json();

          if (data && data.hourly) {
            const hourly = data.hourly;

            this.weatherData = {
              hourly: {
                time: new Date(hourly.time[hourly.time.length - 1]),
                temperature2m: hourly.temperature_2m[hourly.temperature_2m.length - 1],
                relativeHumidity2m: hourly.relative_humidity_2m[hourly.relative_humidity_2m.length - 1],
                precipitationProbability: hourly.precipitation_probability[hourly.precipitation_probability.length - 1],
                precipitation: hourly.precipitation[hourly.precipitation.length - 1],
              },
            };
          }
        });
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  }
});