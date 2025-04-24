import { defineStore } from 'pinia';
import type { WeatherDataDTO } from '~/types/api';

interface WeatherState {
  weatherData: WeatherDataDTO | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  retryCount: number;
}

export const useWeatherStore = defineStore('weather', {
  state: (): WeatherState => ({
    weatherData: null,
    loading: false,
    error: null,
    lastFetched: null,
    retryCount: 0
  }),

  actions: {
    async fetchWeather(forceRefresh = false): Promise<WeatherDataDTO | null> {
      // If data was fetched in the last hour and not forcing refresh, don't fetch again
      if (!forceRefresh && this.lastFetched &&
          (new Date().getTime() - this.lastFetched.getTime() < 3600000)) {
        return this.weatherData;
      }

      this.loading = true;
      this.error = null;

      try {
        // Use default coordinates for São Paulo, Brazil if not specified
        const latitude = -23.55;
        const longitude = -46.64;

        // Real API endpoint with timeout of 5 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation&forecast_days=1`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Error fetching weather data: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform API data to match our DTO
        const currentIndex = new Date().getHours();

        this.weatherData = {
          hourly: {
            time: new Date(),
            temperature2m: data.hourly.temperature_2m[currentIndex] || 0,
            relativeHumidity2m: data.hourly.relative_humidity_2m[currentIndex] || 0,
            precipitationProbability: data.hourly.precipitation_probability[currentIndex] || 0,
            precipitation: data.hourly.precipitation[currentIndex] || 0
          }
        };

        this.lastFetched = new Date();
        this.retryCount = 0; // Reset retry count on success
        return this.weatherData;
      } catch (error) {
        console.error('Error fetching weather data:', error);

        // Set error message
        if (error instanceof DOMException && error.name === 'AbortError') {
          this.error = 'Timeout fetching weather data';
        } else {
          this.error = error instanceof Error ? error.message : 'Unknown error fetching weather data';
        }

        // Retry logic (max 3 attempts)
        if (this.retryCount < 3) {
          this.retryCount++;
          console.log(`Retrying weather data fetch (attempt ${this.retryCount}/3)...`);

          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.fetchWeather(true);
        }

        // Use cached data if available, otherwise use fallback
        if (this.weatherData) {
          return this.weatherData;
        }

        // Fallback data
        this.weatherData = {
          hourly: {
            time: new Date(),
            temperature2m: 25,
            relativeHumidity2m: 65,
            precipitationProbability: 10,
            precipitation: 0
          }
        };

        return this.weatherData;
      } finally {
        this.loading = false;
      }
    }
  }
});