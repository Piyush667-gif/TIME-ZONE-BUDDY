class TimeZoneBuddy {
    constructor() {
        this.cities = [];
        this.cityTimezones = {
            // Major cities and their timezones
            'new york': 'America/New_York',
            'los angeles': 'America/Los_Angeles',
            'chicago': 'America/Chicago',
            'london': 'Europe/London',
            'paris': 'Europe/Paris',
            'berlin': 'Europe/Berlin',
            'tokyo': 'Asia/Tokyo',
            'sydney': 'Australia/Sydney',
            'mumbai': 'Asia/Kolkata',
            'dubai': 'Asia/Dubai',
            'singapore': 'Asia/Singapore',
            'hong kong': 'Asia/Hong_Kong',
            'toronto': 'America/Toronto',
            'vancouver': 'America/Vancouver',
            'mexico city': 'America/Mexico_City',
            'sao paulo': 'America/Sao_Paulo',
            'buenos aires': 'America/Argentina/Buenos_Aires',
            'moscow': 'Europe/Moscow',
            'istanbul': 'Europe/Istanbul',
            'cairo': 'Africa/Cairo',
            'johannesburg': 'Africa/Johannesburg',
            'lagos': 'Africa/Lagos',
            'nairobi': 'Africa/Nairobi',
            'bangkok': 'Asia/Bangkok',
            'jakarta': 'Asia/Jakarta',
            'manila': 'Asia/Manila',
            'seoul': 'Asia/Seoul',
            'beijing': 'Asia/Shanghai',
            'shanghai': 'Asia/Shanghai',
            'delhi': 'Asia/Kolkata',
            'kolkata': 'Asia/Kolkata',
            'karachi': 'Asia/Karachi',
            'dhaka': 'Asia/Dhaka',
            'tehran': 'Asia/Tehran',
            'riyadh': 'Asia/Riyadh',
            'tel aviv': 'Asia/Jerusalem',
            'athens': 'Europe/Athens',
            'rome': 'Europe/Rome',
            'madrid': 'Europe/Madrid',
            'amsterdam': 'Europe/Amsterdam',
            'stockholm': 'Europe/Stockholm',
            'oslo': 'Europe/Oslo',
            'copenhagen': 'Europe/Copenhagen',
            'helsinki': 'Europe/Helsinki',
            'zurich': 'Europe/Zurich',
            'vienna': 'Europe/Vienna',
            'prague': 'Europe/Prague',
            'warsaw': 'Europe/Warsaw',
            'budapest': 'Europe/Budapest',
            'bucharest': 'Europe/Bucharest',
            'sofia': 'Europe/Sofia',
            'kiev': 'Europe/Kiev',
            'minsk': 'Europe/Minsk',
            'riga': 'Europe/Riga',
            'vilnius': 'Europe/Vilnius',
            'tallinn': 'Europe/Tallinn'
        };
        
        this.initializeEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    initializeEventListeners() {
        const cityInput = document.getElementById('cityInput');
        const addCityBtn = document.getElementById('addCityBtn');
        const findMeetingBtn = document.getElementById('findMeetingBtn');

        addCityBtn.addEventListener('click', () => this.addCity());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCity();
        });
        findMeetingBtn.addEventListener('click', () => this.findMeetingTimes());
    }

    addCity() {
        const cityInput = document.getElementById('cityInput');
        const cityName = cityInput.value.trim().toLowerCase();
        
        if (!cityName) return;
        
        const timezone = this.cityTimezones[cityName];
        if (!timezone) {
            alert(`Sorry, "${cityName}" is not in our database. Please try another city.`);
            return;
        }

        // Check if city already exists
        if (this.cities.some(city => city.name.toLowerCase() === cityName)) {
            alert('This city is already added!');
            return;
        }

        const city = {
            name: this.capitalizeWords(cityName),
            timezone: timezone,
            id: Date.now()
        };

        this.cities.push(city);
        cityInput.value = '';
        this.renderCities();
        this.updateFindButton();
    }

    removeCity(cityId) {
        this.cities = this.cities.filter(city => city.id !== cityId);
        this.renderCities();
        this.updateFindButton();
        this.hideResults();
    }

    renderCities() {
        const cityList = document.getElementById('cityList');
        cityList.innerHTML = '';

        this.cities.forEach(city => {
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            
            const currentTime = this.getCurrentTimeInTimezone(city.timezone);
            
            cityItem.innerHTML = `
                <div class="city-info">
                    <div class="city-name">${city.name}</div>
                    <div class="city-timezone">${city.timezone}</div>
                    <div class="city-time">Current time: ${currentTime}</div>
                </div>
                <button class="remove-btn" onclick="timezoneBuddy.removeCity(${city.id})">Remove</button>
            `;
            
            cityList.appendChild(cityItem);
        });
    }

    updateClock() {
        if (this.cities.length > 0) {
            this.renderCities();
        }
    }

    getCurrentTimeInTimezone(timezone) {
        const now = new Date();
        return now.toLocaleString('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    updateFindButton() {
        const findBtn = document.getElementById('findMeetingBtn');
        findBtn.disabled = this.cities.length < 2;
    }

    findMeetingTimes() {
        if (this.cities.length < 2) return;

        const overlappingWindows = this.calculateOverlappingWindows();
        this.displayResults(overlappingWindows);
    }

    calculateOverlappingWindows() {
        const windows = [];
        
        // For each hour of the day (0-23), check if it's within working hours for all cities
        for (let hour = 0; hour < 24; hour++) {
            const isValidForAll = this.cities.every(city => {
                const localHour = this.convertToLocalHour(hour, city.timezone);
                return localHour >= 9 && localHour < 20; // 9 AM to 8 PM
            });
            
            if (isValidForAll) {
                windows.push(hour);
            }
        }

        // Group consecutive hours into windows
        const groupedWindows = [];
        let currentWindow = [];
        
        windows.forEach((hour, index) => {
            if (currentWindow.length === 0 || hour === windows[index - 1] + 1) {
                currentWindow.push(hour);
            } else {
                if (currentWindow.length > 0) {
                    groupedWindows.push([...currentWindow]);
                }
                currentWindow = [hour];
            }
        });
        
        if (currentWindow.length > 0) {
            groupedWindows.push(currentWindow);
        }

        return groupedWindows;
    }

    convertToLocalHour(utcHour, timezone) {
        const now = new Date();
        const utcTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), utcHour, 0, 0);
        
        const localTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }));
        return localTime.getHours();
    }

    displayResults(windows) {
        const resultsSection = document.getElementById('resultsSection');
        const windowsList = document.getElementById('windowsList');
        const timesList = document.getElementById('timesList');
        const participantsList = document.getElementById('participantsList');

        resultsSection.style.display = 'block';

        if (windows.length === 0) {
            windowsList.innerHTML = '<div class="no-overlap">No overlapping time windows found. Try adjusting the available hours or time zones.</div>';
            timesList.innerHTML = '';
            participantsList.innerHTML = '';
            return;
        }

        // Display time windows
        windowsList.innerHTML = '';
        windows.forEach((window, index) => {
            const startHour = window[0];
            const endHour = window[window.length - 1] + 1;
            
            const windowDiv = document.createElement('div');
            windowDiv.className = 'time-window';
            windowDiv.innerHTML = `
                <h4>Window ${index + 1}</h4>
                <p><strong>UTC Time:</strong> ${this.formatHour(startHour)} - ${this.formatHour(endHour)}</p>
                <p><strong>Duration:</strong> ${window.length} hour${window.length > 1 ? 's' : ''}</p>
            `;
            windowsList.appendChild(windowDiv);
        });

        // Display suggested meeting times
        timesList.innerHTML = '';
        const suggestedTimes = this.generateSuggestedTimes(windows);
        suggestedTimes.forEach((time, index) => {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'suggested-time';
            timeDiv.innerHTML = `
                <h4>Suggestion ${index + 1}</h4>
                <p><strong>UTC Time:</strong> ${this.formatHour(time)}</p>
            `;
            timesList.appendChild(timeDiv);
        });

        // Display times for each participant
        participantsList.innerHTML = '';
        suggestedTimes.forEach((utcTime, timeIndex) => {
            const participantDiv = document.createElement('div');
            participantDiv.className = 'participant-time';
            participantDiv.innerHTML = `
                <h4>Meeting Time ${timeIndex + 1} - Local Times</h4>
                ${this.cities.map(city => {
                    const localHour = this.convertToLocalHour(utcTime, city.timezone);
                    return `<p><strong>${city.name}:</strong> ${this.formatHour(localHour)}</p>`;
                }).join('')}
            `;
            participantsList.appendChild(participantDiv);
        });
    }

    generateSuggestedTimes(windows) {
        const suggestions = [];
        
        windows.forEach(window => {
            // Suggest the middle of each window, or a few good times
            const middleIndex = Math.floor(window.length / 2);
            suggestions.push(window[middleIndex]);
            
            // If window is long enough, suggest beginning and end times too
            if (window.length >= 4) {
                suggestions.push(window[1]); // Near beginning
                suggestions.push(window[window.length - 2]); // Near end
            }
        });

        // Remove duplicates and sort
        return [...new Set(suggestions)].sort((a, b) => a - b).slice(0, 5);
    }

    formatHour(hour) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    }

    capitalizeWords(str) {
        return str.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    hideResults() {
        if (this.cities.length < 2) {
            document.getElementById('resultsSection').style.display = 'none';
        }
    }
}

// Initialize the application
const timezoneBuddy = new TimeZoneBuddy();
