import { TestBed, async, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { WeatherDisplay } from '../models/weatherDisplay';

describe('WeatherService', () => {
    let weatherService: WeatherService;
    const weatherDisplay: WeatherDisplay = require('../../assets/testing/weather-display.json');
    const metadata: any = require('../../assets/testing/metadata.json');
    const detailedForecast: any = require('../../assets/testing/detailed-forecast.json');
    // TODO add tests for open weather map API calls
    const currentWeather: any = require('../../assets/testing/current-weather.json');
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpClient = TestBed.get(HttpClient);
        httpTestingController = TestBed.get(HttpTestingController);
        weatherService = TestBed.get(WeatherService);
    }));

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(weatherService).toBeTruthy();
    });

    it('should return weatherDisplay when called', (done: DoneFn) => {
        const latitude = '37.6584';
        const longitude = '-77.6526';
        spyOn(weatherService, 'getMetadata').and.returnValue(Promise.resolve(metadata));
        spyOn(weatherService, 'getCurrentWeatherOpenWeatherMapAPI').and.returnValue(Promise.resolve(currentWeather));
        spyOn(weatherService, 'getDetailedForecast').and.returnValue(Promise.resolve(detailedForecast));
        weatherService.getWeather(latitude, longitude).then(
            value => {
                expect(value.latitude).toBe(latitude);
                expect(value.longitude).toBe(longitude);
                const city = metadata['properties']['relativeLocation']['properties']['city'];
                const state = metadata['properties']['relativeLocation']['properties']['state'];
                expect(value.currentLocation).toBe(city + ', ' + state);
                expect(value.forecastURL).toBe(metadata['properties']['forecast']);
                expect(value.forecast).toBe(detailedForecast['properties']['periods']);
                done();
            }
        );
    });

    it('should catch error when metada call is not successful on getWeather call', () => {
        const latitude = '37.3069';
        const longitude = '-76.7496';
        const metadataURL = 'https://api.weather.gov/points/' + latitude + ',' + longitude;
        weatherService.getWeather(latitude, longitude).then(
            value => {
                expect(value.errorMessage).toBe('error when calling metadataURL');
        });
        const req = httpTestingController.expectOne(metadataURL);
        expect(req.request.method).toEqual('GET');
        req.flush(Promise.reject());
    });

    it('should catch error when detailed forecast call is not successful on getWeather call', (done: DoneFn) => {
        const latitude = '37.3069';
        const longitude = '-76.7496';
        spyOn(weatherService, 'getMetadata').and.returnValue(Promise.resolve(metadata));
        spyOn(weatherService, 'getCurrentWeatherOpenWeatherMapAPI').and.returnValue(Promise.resolve(currentWeather));
        spyOn(weatherService, 'getDetailedForecast').and.returnValue(Promise.reject(Error('error when calling forecastURL')));
        weatherService.getWeather(latitude, longitude).then(
        value => {
            expect(value.errorMessage).toBe('error when calling forecastURL');
            done();
        });
    });

    it('should return metadata when called', () => {
        const latitude = '37.3069';
        const longitude = '-76.7496';
        const metadataURL = 'https://api.weather.gov/points/' + latitude + ',' + longitude;
        weatherService.getMetadata(latitude, longitude).then(
        value => {
            expect(value).toBe(metadata);
        });
        const req = httpTestingController.expectOne(metadataURL);
        expect(req.request.method).toEqual('GET');
        req.flush(metadata);
    });

    it('should catch error when the metadata call is not successful', () => {
        const latitude = '37.3069';
        const longitude = '-76.7496';
        const metadataURL = 'https://api.weather.gov/points/' + latitude + ',' + longitude;
        weatherService.getMetadata(latitude, longitude).then(
        value => {
            expect(value).toEqual(Error('error when calling metadataURL'));
        });
        const req = httpTestingController.expectOne(metadataURL);
        expect(req.request.method).toEqual('GET');
        req.flush(Promise.reject());
    });

    it('should catch error when radar stations call is not succcessful', () => {
        const radarStationURL = 'https://api.weather.gov/stations/KRIC';
        weatherService.getRadarStation(radarStationURL).then(
            value => {
                expect(value).toEqual(Error('error when calling radarStationURL'));
        });
        const req = httpTestingController.expectOne(radarStationURL);
        expect(req.request.method).toEqual('GET');
        req.flush(Promise.reject());
    });

    it('should catch error when latest observations call is not successful', () => {
        const observationsURL = 'https://api.weather.gov/stations/KAKQ/observations/latest';
        weatherService.getLatestObservations(observationsURL).then(
            value => {
                expect(value).toEqual(Error('error when calling observationsURL'));
            });
        const req = httpTestingController.expectOne(observationsURL);
        expect(req.request.method).toEqual('GET');
        req.flush(Promise.reject());
    });

    it('should return detailed forecast when called', () => {
        const forecastURL = 'https://api.weather.gov/gridpoints/AKQ/36,80/forecast';
        weatherService.getDetailedForecast(forecastURL).then(
            value => {
                expect(value).toBe(detailedForecast);
            });
        const req = httpTestingController.expectOne(forecastURL);
        expect(req.request.method).toEqual('GET');
        req.flush(detailedForecast);
    });

    it('should catch error when detailed forecast call is not successful', () => {
        const forecastURL = 'https://api.weather.gov/gridpoints/AKQ/36,80/forecast';
        weatherService.getDetailedForecast(forecastURL).then(
            value => {
                expect(value).toEqual(Error('error when calling forecastURL'));
            });
        const req = httpTestingController.expectOne(forecastURL);
        expect(req.request.method).toEqual('GET');
        req.flush(Promise.reject());
    });
});
