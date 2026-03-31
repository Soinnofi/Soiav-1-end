let currentStep = 1;
let apps = [];
let installedApps = new Set();
let activeWindows = new Set();
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let currentAppCalendarMonth = new Date().getMonth();
let currentAppCalendarYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    loadApps();
    createLiveTiles();
    updateTime();
    setInterval(updateTime, 1000);
    initializeSetupHandlers();
    initializeCalendar();
    initializeAppCalendar();
});

function initializeSetupHandlers() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const theme = this.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
        });
    });

    document.querySelectorAll('.wallpaper-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.wallpaper-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initializeSystem() {
    const savedTheme = localStorage.getItem('soiav-theme');
    const savedWallpaper = localStorage.getItem('soiav-wallpaper');
    const savedUsername = localStorage.getItem('soiav-username');
    const savedAccentColor = localStorage.getItem('soiav-accent-color');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeSelector(savedTheme);
    }
    
    if (savedWallpaper) {
        setWallpaper(savedWallpaper);
    }
    
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        updateUserInfo(savedUsername);
    }
    
    if (savedAccentColor) {
        document.documentElement.style.setProperty('--accent-color', savedAccentColor);
        document.getElementById('accentColor').value = savedAccentColor;
    }

    if (localStorage.getItem('soiav-setup-completed')) {
        completeSetup();
    }
}

function nextStep(step) {
    if (step === 5) {
        startFinalSetup();
        return;
    }
    
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
}

function prevStep(step) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
}

function startFinalSetup() {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById('step5').classList.add('active');
    currentStep = 5;

    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const steps = [
        {text: 'Подготовка системы...', duration: 1000},
        {text: 'Настройка тем...', duration: 1500},
        {text: 'Применение обоев...', duration: 1200},
        {text: 'Конфигурация системы...', duration: 1800},
        {text: 'Оптимизация...', duration: 2000},
        {text: 'Завершение...', duration: 1500}
    ];

    let totalTime = 0;
    steps.forEach(step => totalTime += step.duration);

    let currentProgress = 0;
    let currentStepIndex = 0;

    function updateProgress() {
        if (currentStepIndex < steps.length) {
            const step = steps[currentStepIndex];
            progressText.textContent = step.text;
            
            setTimeout(() => {
                currentProgress += (step.duration / totalTime) * 100;
                progressFill.style.width = currentProgress + '%';
                currentStepIndex++;
                updateProgress();
            }, step.duration);
        } else {
            setTimeout(() => {
                completeSetup();
            }, 1000);
        }
    }

    updateProgress();
}

function completeSetup() {
    const theme = document.querySelector('.theme-option.active')?.dataset.theme || 'light';
    const wallpaper = document.querySelector('.wallpaper-option.active')?.dataset.wallpaper || '1';
    const username = document.getElementById('username').value || 'Пользователь Soiav';
    const accentColor = document.getElementById('accentColor').value;
    const systemDisk = document.getElementById('systemDisk')?.value || 'C';
    const performance = document.getElementById('performance')?.value || 'balanced';
    const timezone = document.getElementById('timezone')?.value || 'moscow';

    localStorage.setItem('soiav-theme', theme);
    localStorage.setItem('soiav-wallpaper', wallpaper);
    localStorage.setItem('soiav-username', username);
    localStorage.setItem('soiav-accent-color', accentColor);
    localStorage.setItem('soiav-system-disk', systemDisk);
    localStorage.setItem('soiav-performance', performance);
    localStorage.setItem('soiav-timezone', timezone);
    localStorage.setItem('soiav-setup-completed', 'true');

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    setWallpaper(wallpaper);
    updateUserInfo(username);

    document.querySelector('.setup-wizard').classList.remove('active');
    document.querySelector('.desktop').classList.add('active');

    setTimeout(() => {
        showNotification('Добро пожаловать!', `Добро пожаловать в Soiav 1, ${username}!`);
    }, 1000);
}

function setWallpaper(wallpaperId) {
    const wallpapers = {
        '1': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        '2': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        '3': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
        '4': 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'
    };
    
    if (wallpapers[wallpaperId]) {
        document.querySelector('.desktop').style.backgroundImage = `url('${wallpapers[wallpaperId]}')`;
    }
}

function updateUserInfo(username) {
    const nameElement = document.getElementById('userName');
    const nameStartElement = document.getElementById('userNameStart');
    
    if (nameElement) nameElement.textContent = username;
    if (nameStartElement) nameStartElement.textContent = username;
    
    const initials = username.split(' ').map(n => n[0]).join('').toUpperCase() || 'ПС';
    
    const smallAvatar = document.querySelector('.user-avatar-small');
    const largeAvatar = document.querySelector('.user-avatar-large');
    const avatar = document.querySelector('.user-avatar');
    
    if (smallAvatar) smallAvatar.textContent = initials;
    if (largeAvatar) largeAvatar.textContent = initials;
    if (avatar) avatar.textContent = initials;
}

function updateThemeSelector(theme) {
    document.querySelectorAll('.theme-option').forEach(opt => {
        if (opt.dataset.theme === theme) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function openApp(appId) {
    const window = document.getElementById(appId);
    if (window) {
        window.classList.add('active');
        activeWindows.add(appId);
        updateTaskbar(appId, true);
        
        if (!document.querySelector(`.taskbar-app[data-app="${appId}"]`)) {
            const appElement = document.querySelector(`[data-app="${appId}"]`);
            if (appElement) {
                const icon = appElement.querySelector('i').className;
                addToTaskbar(appId, icon);
            }
        }
        
        window.style.animation = 'windowSlideIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        setTimeout(() => {
            window.style.animation = '';
        }, 300);
    }
}

function closeWindow(appId) {
    const window = document.getElementById(appId);
    if (window) {
        window.classList.remove('active');
        activeWindows.delete(appId);
        updateTaskbar(appId, false);
        
        window.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            window.style.animation = '';
        }, 200);
    }
}

function minimizeWindow(appId) {
    const window = document.getElementById(appId);
    if (window) {
        window.classList.remove('active');
        updateTaskbar(appId, false);
        
        window.style.transform = 'scale(0.8)';
        window.style.opacity = '0';
        setTimeout(() => {
            window.style.transform = '';
            window.style.opacity = '';
        }, 300);
    }
}

function maximizeWindow(appId) {
    const window = document.getElementById(appId);
    if (window) {
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
            window.style.width = '';
            window.style.height = '';
            window.style.top = '';
            window.style.left = '';
        } else {
            window.classList.add('maximized');
            window.style.width = '95vw';
            window.style.height = '90vh';
            window.style.top = '2.5vh';
            window.style.left = '2.5vw';
        }
    }
}

function toggleApp(appId) {
    const window = document.getElementById(appId);
    if (window && window.classList.contains('active')) {
        minimizeWindow(appId);
    } else {
        openApp(appId);
    }
}

function updateTaskbar(appId, isActive) {
    const taskbarApp = document.querySelector(`.taskbar-app[data-app="${appId}"]`);
    if (taskbarApp) {
        if (isActive) {
            taskbarApp.classList.add('active');
        } else {
            taskbarApp.classList.remove('active');
        }
    }
}

function addToTaskbar(appId, iconClass) {
    const taskbarApps = document.getElementById('taskbarApps');
    const appElement = document.createElement('div');
    appElement.className = 'taskbar-app';
    appElement.setAttribute('data-app', appId);
    appElement.innerHTML = `<i class="${iconClass}"></i>`;
    appElement.onclick = () => toggleApp(appId);
    taskbarApps.appendChild(appElement);
}

function toggleStartMenu() {
    const startMenu = document.querySelector('.start-menu');
    startMenu.classList.toggle('active');
    
    if (startMenu.classList.contains('active')) {
        startMenu.style.animation = 'fadeIn 0.3s ease';
    }
}

function toggleSideMenu() {
    const sideMenu = document.querySelector('.side-menu');
    sideMenu.classList.toggle('active');
}

function toggleNotificationCenter() {
    const notificationCenter = document.querySelector('.notification-center');
    notificationCenter.classList.toggle('active');
}

function toggleAccountMenu() {
    const accountMenu = document.querySelector('.account-menu');
    accountMenu.classList.toggle('active');
}

function toggleCalendar() {
    const calendarPopup = document.getElementById('calendarPopup');
    calendarPopup.classList.toggle('active');
    updateCalendar();
}

function toggleWiFi() {
    const toggle = document.querySelector('.quick-setting:nth-child(1) .toggle-switch');
    if (toggle) {
        toggle.classList.toggle('active');
        showNotification('Wi-Fi', toggle.classList.contains('active') ? 'Включено' : 'Выключено');
    }
}

function toggleBluetooth() {
    const toggle = document.querySelector('.quick-setting:nth-child(2) .toggle-switch');
    if (toggle) {
        toggle.classList.toggle('active');
        showNotification('Bluetooth', toggle.classList.contains('active') ? 'Включено' : 'Выключено');
    }
}

function toggleAirplane() {
    const toggle = document.querySelector('.quick-setting:nth-child(3) .toggle-switch');
    if (toggle) {
        toggle.classList.toggle('active');
        showNotification('Режим полета', toggle.classList.contains('active') ? 'Включено' : 'Выключено');
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('soiav-theme', newTheme);
    updateThemeSelector(newTheme);
    
    const toggle = document.querySelector('.quick-setting:nth-child(4) .toggle-switch');
    if (toggle) {
        toggle.classList.toggle('active');
    }
    showNotification('Темный режим', newTheme === 'dark' ? 'Включено' : 'Выключено');
}

function showNotification(title, text) {
    console.log(`Уведомление: ${title} - ${text}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--background-secondary);
        color: var(--text-primary);
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid var(--accent-color);
        z-index: 10000;
        max-width: 280px;
        animation: slideInRight 0.3s ease;
    `;
    notification.innerHTML = `
        <strong>${title}</strong><br>
        <span style="font-size: 11px; color: var(--text-secondary);">${text}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const currentTime = document.getElementById('currentTime');
    const currentDate = document.getElementById('currentDate');
    
    if (currentTime) currentTime.textContent = timeString;
    if (currentDate) currentDate.textContent = dateString;
}

function initializeCalendar() {
    updateCalendar();
}

function updateCalendar() {
    const calendarMonth = document.getElementById('calendarMonth');
    const calendarDays = document.getElementById('calendarDays');
    
    if (!calendarMonth || !calendarDays) return;
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    calendarMonth.textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
    
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
    const today = new Date();
    
    let daysHtml = '';
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startingDay; i++) {
        const prevMonthDay = new Date(currentCalendarYear, currentCalendarMonth, -i);
        daysHtml += `<div class="calendar-day-popup other-month">${prevMonthDay.getDate()}</div>`;
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const isToday = day === today.getDate() && 
                       currentCalendarMonth === today.getMonth() && 
                       currentCalendarYear === today.getFullYear();
        const dayClass = isToday ? 'calendar-day-popup current' : 'calendar-day-popup';
        daysHtml += `<div class="${dayClass}">${day}</div>`;
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + lastDay.getDate());
    
    for (let i = 1; i <= remainingCells; i++) {
        daysHtml += `<div class="calendar-day-popup other-month">${i}</div>`;
    }
    
    calendarDays.innerHTML = daysHtml;
}

function changeCalendarMonth(direction) {
    currentCalendarMonth += direction;
    if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
    } else if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
    }
    updateCalendar();
}

function initializeAppCalendar() {
    updateAppCalendar();
}

function updateAppCalendar() {
    const appCalendarMonth = document.getElementById('appCalendarMonth');
    const appCalendarDays = document.getElementById('appCalendarDays');
    
    if (!appCalendarMonth || !appCalendarDays) return;
    
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    appCalendarMonth.textContent = `${monthNames[currentAppCalendarMonth]} ${currentAppCalendarYear}`;
    
    const firstDay = new Date(currentAppCalendarYear, currentAppCalendarMonth, 1);
    const lastDay = new Date(currentAppCalendarYear, currentAppCalendarMonth + 1, 0);
    const today = new Date();
    
    let daysHtml = '';
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startingDay; i++) {
        const prevMonthDay = new Date(currentAppCalendarYear, currentAppCalendarMonth, -i);
        daysHtml += `<div class="calendar-day other-month">${prevMonthDay.getDate()}</div>`;
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const isToday = day === today.getDate() && 
                       currentAppCalendarMonth === today.getMonth() && 
                       currentAppCalendarYear === today.getFullYear();
        const dayClass = isToday ? 'calendar-day current' : 'calendar-day';
        daysHtml += `<div class="${dayClass}">${day}</div>`;
    }
    
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + lastDay.getDate());
    
    for (let i = 1; i <= remainingCells; i++) {
        daysHtml += `<div class="calendar-day other-month">${i}</div>`;
    }
    
    appCalendarDays.innerHTML = daysHtml;
}

function changeAppCalendarMonth(direction) {
    currentAppCalendarMonth += direction;
    if (currentAppCalendarMonth < 0) {
        currentAppCalendarMonth = 11;
        currentAppCalendarYear--;
    } else if (currentAppCalendarMonth > 11) {
        currentAppCalendarMonth = 0;
        currentAppCalendarYear++;
    }
    updateAppCalendar();
}

function loadApps() {
    apps = [
        {
            id: 'calculator',
            title: 'Калькулятор',
            description: 'Простой и удобный калькулятор',
            icon: 'fas fa-calculator',
            category: 'utilities',
            size: '2.3 MB',
            rating: 4.5,
            installed: false,
            isNew: true
        },
        {
            id: 'snake',
            title: 'Змейка',
            description: 'Классическая игра змейка',
            icon: 'fas fa-gamepad',
            category: 'games',
            size: '1.8 MB',
            rating: 4.8,
            installed: false,
            isNew: true
        },
        {
            id: 'tetris',
            title: 'Тетрис',
            description: 'Классический тетрис',
            icon: 'fas fa-th-large',
            category: 'games',
            size: '2.1 MB',
            rating: 4.9,
            installed: false,
            isNew: false
        },
        {
            id: 'minesweeper',
            title: 'Сапер',
            description: 'Классический сапер',
            icon: 'fas fa-flag',
            category: 'games',
            size: '1.5 MB',
            rating: 4.3,
            installed: false,
            isNew: false
        },
        {
            id: 'chess',
            title: 'Шахматы',
            description: 'Классические шахматы',
            icon: 'fas fa-chess',
            category: 'games',
            size: '3.4 MB',
            rating: 4.7,
            installed: false,
            isNew: true
        },
        {
            id: 'sudoku',
            title: 'Судоку',
            description: 'Головоломка судоку',
            icon: 'fas fa-table',
            category: 'games',
            size: '2.2 MB',
            rating: 4.4,
            installed: false,
            isNew: false
        },
        {
            id: 'puzzle',
            title: 'Паззлы',
            description: 'Собирайте паззлы',
            icon: 'fas fa-puzzle-piece',
            category: 'games',
            size: '4.7 MB',
            rating: 4.2,
            installed: false,
            isNew: false
        },
        {
            id: 'memory',
            title: 'Память',
            description: 'Игра на память',
            icon: 'fas fa-brain',
            category: 'games',
            size: '1.9 MB',
            rating: 4.5,
            installed: false,
            isNew: true
        },
        {
            id: 'racer',
            title: 'Гонки',
            description: 'Аркадные гонки',
            icon: 'fas fa-car',
            category: 'games',
            size: '8.3 MB',
            rating: 4.6,
            installed: false,
            isNew: false
        }
    ];
    
    renderApps();
}

function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;
    
    appsGrid.innerHTML = '';
    
    apps.forEach(app => {
        const appCard = document.createElement('div');
        appCard.className = 'app-card';
        appCard.innerHTML = `
            ${app.isNew ? '<div class="new-badge">Новый</div>' : ''}
            <div class="app-icon">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-title">${app.title}</div>
            <div class="app-desc">${app.description}</div>
            <div class="app-meta">
                <span>${app.size}</span>
                <span>★ ${app.rating}</span>
            </div>
            <button class="install-btn ${app.installed ? 'installed' : ''}" 
                    onclick="installApp('${app.id}')">
                ${app.installed ? 'Установлено' : 'Установить'}
            </button>
        `;
        appsGrid.appendChild(appCard);
    });
}

function installApp(appId) {
    const app = apps.find(a => a.id === appId);
    if (app && !app.installed) {
        app.installed = true;
        installedApps.add(appId);
        renderApps();
        
        createDesktopIcon(app);
        
        showNotification('Установка', `Приложение "${app.title}" успешно установлено!`);
    }
}

function createDesktopIcon(app) {
    const desktopIcons = document.querySelector('.desktop-icons');
    if (!desktopIcons) return;
    
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.setAttribute('data-app', app.id);
    icon.innerHTML = `
        <i class="${app.icon}"></i>
        <span>${app.title}</span>
    `;
    icon.onclick = () => openApp(app.id);
    desktopIcons.appendChild(icon);
}

function createLiveTiles() {
    const tilesRow = document.querySelector('.tiles-row');
    if (!tilesRow) return;
    
    const tiles = [
        { icon: 'fas fa-folder', title: 'Проводник', color: '#0078d7', size: 'small' },
        { icon: 'fas fa-globe', title: 'Браузер', color: '#107c10', size: 'small' },
        { icon: 'fas fa-shopping-bag', title: 'Магазин', color: '#e81123', size: 'wide' },
        { icon: 'fas fa-cog', title: 'Настройки', color: '#744da9', size: 'small' },
        { icon: 'fas fa-images', title: 'Фотографии', color: '#008272', size: 'medium' },
        { icon: 'fas fa-music', title: 'Музыка', color: '#bf0077', size: 'medium' },
        { icon: 'fas fa-calendar-alt', title: 'Календарь', color: '#004b50', size: 'medium' },
        { icon: 'fas fa-gamepad', title: 'Игры', color: '#f7630c', size: 'large' }
    ];
    
    tiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = `live-tile ${tile.size}`;
        tileElement.style.background = `linear-gradient(135deg, ${tile.color}, ${lightenColor(tile.color, 20)})`;
        tileElement.innerHTML = `
            <div class="tile-content">
                <i class="tile-icon ${tile.icon}"></i>
                <div class="tile-title">${tile.title}</div>
            </div>
        `;
        tileElement.onclick = () => {
            if (tile.title === 'Проводник') openApp('fileExplorer');
            else if (tile.title === 'Браузер') openApp('browser');
            else if (tile.title === 'Магазин') openApp('store');
            else if (tile.title === 'Настройки') openApp('settings');
            else if (tile.title === 'Фотографии') openApp('photos');
            else if (tile.title === 'Музыка') openApp('music');
            else if (tile.title === 'Календарь') openApp('calendar');
            else if (tile.title === 'Игры') openApp('store');
            toggleStartMenu();
        };
        tilesRow.appendChild(tileElement);
    });
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function handleTerminalCommand(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('terminalInput');
        const command = input.value.trim();
        input.value = '';
        
        const output = document.getElementById('terminalOutput');
        if (!output) return;
        
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line';
        newLine.innerHTML = `<span class="prompt">user@soiav:~$ </span><span class="command">${command}</span>`;
        output.appendChild(newLine);
        
        handleCommand(command, output);
        
        output.scrollTop = output.scrollHeight;
    }
}

function handleCommand(command, output) {
    const response = document.createElement('div');
    
    switch (command.toLowerCase()) {
        case 'help':
            response.innerHTML = `
                Доступные команды:<br>
                - help: показать эту справку<br>
                - neofetch: информация о системе<br>
                - date: текущая дата и время<br>
                - clear: очистить терминал<br>
                - echo [текст]: повторить текст<br>
                - apps: список установленных приложений
            `;
            break;
        case 'neofetch':
            response.innerHTML = `
                <div class="system-info">
                    <div class="ascii-art">
                        <pre>Soiav OS 1.0</pre>
                    </div>
                    <div class="sys-info">
                        <div>Soiav OS 1.0</div>
                        <div>Kernel: 6.4.2-soiav</div>
                        <div>DE: Soiav Desktop Environment</div>
                        <div>Shell: soiav-sh 2.1.4</div>
                        <div>Terminal: Soiav Terminal</div>
                    </div>
                </div>
            `;
            break;
        case 'date':
            response.textContent = new Date().toString();
            break;
        case 'clear':
            output.innerHTML = '';
            return;
        case 'apps':
            response.textContent = `Установлено приложений: ${installedApps.size}`;
            break;
        case '':
            return;
        default:
            if (command.startsWith('echo ')) {
                response.textContent = command.substring(5);
            } else {
                response.textContent = `Команда не найдена: ${command}. Введите 'help' для списка команд.`;
            }
    }
    
    output.appendChild(response);
}

function initializeSettings() {
    document.querySelectorAll('.settings-category').forEach(category => {
        category.addEventListener('click', function() {
            const categoryId = this.dataset.category;
            
            document.querySelectorAll('.settings-category').forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.settings-section').forEach(section => section.classList.remove('active'));
            const targetSection = document.getElementById(categoryId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeSettings);

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soiav-theme', theme);
    updateThemeSelector(theme);
}

function changeAccentColor(color) {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('soiav-accent-color', color);
}

function checkForUpdates() {
    showNotification('Обновления', 'Проверка обновлений...');
    setTimeout(() => {
        showNotification('Обновления', 'Обновлений не найдено. Ваша система актуальна.');
    }, 2000);
}

function lockScreen() {
    showNotification('Система', 'Экран заблокирован');
    toggleAccountMenu();
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        showNotification('Система', 'Выход из системы...');
        setTimeout(() => {
            localStorage.removeItem('soiav-setup-completed');
            location.reload();
        }, 1000);
    }
}

function openFile(fileType) {
    if (fileType === 'documents' || fileType === 'images' || fileType === 'downloads' || fileType === 'music' || fileType === 'videos') {
        showNotification('Проводник', `Открыта папка: ${fileType}`);
    } else {
        openFileViewer(fileType);
    }
}

function openFileViewer(filename) {
    const fileViewer = document.getElementById('fileViewer');
    const fileViewerContent = document.getElementById('fileViewerContent');
    
    let content = '';
    let title = '';
    
    switch (filename) {
        case 'document.txt':
            title = 'Документ.txt';
            content = `
                <div class="file-content">
                    <h3>Пример документа</h3>
                    <p>Это пример текстового файла в системе Soiav 1.</p>
                    <p>Вы можете создавать, редактировать и сохранять текстовые файлы.</p>
                    <p>Дата создания: ${new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            `;
            break;
        case 'image.jpg':
            title = 'Изображение.jpg';
            content = `
                <div class="file-content">
                    <h3>Просмотр изображения</h3>
                    <p>Это пример просмотра изображения в системе Soiav 1.</p>
                    <div style="background: var(--background-primary); padding: 20px; border-radius: 8px; text-align: center;">
                        <i class="fas fa-image" style="font-size: 48px; color: var(--accent-color); margin-bottom: 15px;"></i>
                        <p>Здесь будет отображаться изображение</p>
                    </div>
                    <p style="margin-top: 15px;">Размер: 2.4 MB<br>Разрешение: 1920x1080</p>
                </div>
            `;
            break;
        case 'music.mp3':
            title = 'Музыка.mp3';
            content = `
                <div class="file-content">
                    <h3>Аудио файл</h3>
                    <p>Это пример аудио файла в системе Soiav 1.</p>
                    <div style="background: var(--background-primary); padding: 20px; border-radius: 8px; text-align: center;">
                        <i class="fas fa-music" style="font-size: 48px; color: var(--accent-color); margin-bottom: 15px;"></i>
                        <p>Здесь будет воспроизводиться музыка</p>
                    </div>
                    <p style="margin-top: 15px;">Формат: MP3<br>Длительность: 3:45</p>
                </div>
            `;
            break;
    }
    
    fileViewer.querySelector('.window-header span').innerHTML = `<i class="fas fa-file"></i> ${title}`;
    fileViewerContent.innerHTML = content;
    openApp('fileViewer');
}

function openPhoto(photoId) {
    showNotification('Фотографии', `Открыто изображение: ${photoId}`);
}

function playTrack(trackId) {
    const nowPlaying = document.querySelector('.now-playing');
    const trackTitle = nowPlaying.querySelector('.track-title');
    const trackArtist = nowPlaying.querySelector('.track-artist');
    
    trackTitle.textContent = 'Композиция ' + trackId.slice(-1);
    trackArtist.textContent = 'Исполнитель';
    
    showNotification('Музыка', `Воспроизведение: Композиция ${trackId.slice(-1)}`);
}

let dragElement = null;
let dragOffset = { x: 0, y: 0 };

document.addEventListener('mousedown', function(e) {
    if (e.target.closest('.window-header')) {
        const header = e.target.closest('.window-header');
        const window = header.parentElement;
        
        dragElement = window;
        dragOffset.x = e.clientX - window.offsetLeft;
        dragOffset.y = e.clientY - window.offsetTop;
        
        document.querySelectorAll('.window').forEach(w => {
            w.style.zIndex = '100';
        });
        window.style.zIndex = '1000';
    }
});

document.addEventListener('mousemove', function(e) {
    if (dragElement) {
        dragElement.style.left = (e.clientX - dragOffset.x) + 'px';
        dragElement.style.top = (e.clientY - dragOffset.y) + 'px';
    }
});

document.addEventListener('mouseup', function() {
    dragElement = null;
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.account-btn') && !e.target.closest('.account-menu')) {
        const accountMenu = document.querySelector('.account-menu');
        if (accountMenu) accountMenu.classList.remove('active');
    }
    
    if (!e.target.closest('.start-btn') && !e.target.closest('.start-menu')) {
        const startMenu = document.querySelector('.start-menu');
        if (startMenu) startMenu.classList.remove('active');
    }
    
    if (!e.target.closest('.tray-icon') && !e.target.closest('.notification-center')) {
        const notificationCenter = document.querySelector('.notification-center');
        if (notificationCenter) notificationCenter.classList.remove('active');
    }
    
    if (!e.target.closest('.tray-icon') && !e.target.closest('.side-menu')) {
        const sideMenu = document.querySelector('.side-menu');
        if (sideMenu) sideMenu.classList.remove('active');
    }
    
    if (!e.target.closest('.time-display') && !e.target.closest('.calendar-popup')) {
        const calendarPopup = document.getElementById('calendarPopup');
        if (calendarPopup) calendarPopup.classList.remove('active');
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
// ==================== LEGACY SHUTDOWN (2034-2035) ====================
let legacyMode = true;
let serviceBlocked = new Set(['store', 'weather', 'onlineGames', 'cloudSync']);

function showLegacyShutdown() {
    const legacyNotice = document.getElementById('legacyNotice');
    if (legacyNotice) legacyNotice.style.display = 'flex';
    
    // Disable online services
    disableOnlineServices();
    
    // Show warning in terminal if exists
    const terminalOutput = document.getElementById('terminalOutput');
    if (terminalOutput) {
        const warnLine = document.createElement('div');
        warnLine.className = 'terminal-line';
        warnLine.style.color = '#ff8866';
        warnLine.innerHTML = `<span class="prompt">⚠️ </span><span class="command">[КРИТИЧЕСКОЕ УВЕДОМЛЕНИЕ] Поддержка Soiav 1 прекращена с 2034 г. Магазин и онлайн-сервисы отключены с 2035 г.</span>`;
        terminalOutput.appendChild(warnLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

function dismissLegacyNotice() {
    const notice = document.getElementById('legacyNotice');
    if (notice) {
        notice.style.opacity = '0';
        setTimeout(() => {
            notice.style.display = 'none';
        }, 300);
    }
    showShutdownToast('Система переведена в локальный режим (EOL)');
}

function disableOnlineServices() {
    // Block store functionality
    if (window.storeBlocked) return;
    window.storeBlocked = true;
    
    // Remove online games from apps list
    apps = apps.filter(app => !['onlineRacing', 'multiplayerChess', 'cloudSudoku'].includes(app.id));
    renderApps();
    
    // Disable weather tile if exists
    const weatherTile = document.querySelector('.live-tile[data-service="weather"]');
    if (weatherTile) weatherTile.remove();
    
    // Patch installApp to block new installs from cloud
    const originalInstall = window.installApp;
    window.installApp = function(appId) {
        const app = apps.find(a => a.id === appId);
        if (app && app.requiresCloud === true) {
            showShutdownToast('Невозможно установить: облачные сервисы отключены с 2035 года');
            return;
        }
        originalInstall(appId);
    };
}

function showShutdownToast(message, isError = true) {
    const toast = document.getElementById('serviceShutdownToast');
    if (!toast) return;
    
    toast.innerHTML = `<i class="fas ${isError ? 'fa-skull-crossbones' : 'fa-info-circle'}"></i> ${message}`;
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 400);
    }, 3800);
}

// Override store opening to show shutdown message
const originalOpenApp = window.openApp;
window.openApp = function(appId) {
    if (appId === 'store' && legacyMode) {
        showShutdownToast('Soiav Store закрыт (поддержка прекращена с 2035 года)');
        return;
    }
    if (appId === 'weatherApp' && legacyMode) {
        showShutdownToast('Погода недоступна — сервис отключён');
        return;
    }
    originalOpenApp(appId);
};

// Patch store categories to disable online features
function patchStoreCategories() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (legacyMode && this.innerText.includes('Онлайн')) {
                e.stopPropagation();
                showShutdownToast('Онлайн-категории отключены (EOL)');
            }
        });
    });
}

// Show system EOL info in terminal command "eol"
const originalHandleCommand = window.handleCommand;
window.handleCommand = function(command, output) {
    if (command.toLowerCase() === 'eol') {
        const response = document.createElement('div');
        response.innerHTML = `
            <div style="border-left: 3px solid #e74c3c; padding-left: 12px; margin: 8px 0;">
                <strong>⚠️ Soiav 1 — Конец жизненного цикла</strong><br>
                • Поддержка основной ОС прекращена: <strong>2034</strong><br>
                • Магазин и онлайн-сервисы отключены: <strong>2035</strong><br>
                • Рекомендуется обновление до Soiav 2 или переход на локальный режим.<br>
                • Некоторые функции могут работать некорректно.
            </div>
        `;
        output.appendChild(response);
        return;
    }
    originalHandleCommand(command, output);
};

// Patch any online game launcher attempts
function blockOnlineGames() {
    const gameItems = document.querySelectorAll('[data-online="true"]');
    gameItems.forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            showShutdownToast('Мультиплеер недоступен: серверы Soiav закрыты');
        });
    });
}

// Override any weather API simulation
window.updateWeather = function() {
    if (legacyMode) {
        showShutdownToast('Сервис погоды отключён (2035)');
        return;
    }
};

// Initialize legacy system after setup
const originalCompleteSetup = window.completeSetup;
window.completeSetup = function() {
    originalCompleteSetup();
    setTimeout(() => {
        showLegacyShutdown();
        patchStoreCategories();
        blockOnlineGames();
        // Show EOL message in console
        console.log('%c⚠️ Soiav 1 — конец поддержки (2034-2035)', 'color: #e74c3c; font-size: 14px; font-weight: bold;');
    }, 1800);
};

// Also block any external API calls (mock)
window.fetch = new Proxy(window.fetch, {
    apply: function(target, thisArg, args) {
        const url = args[0];
        if (typeof url === 'string' && (url.includes('weather') || url.includes('store.soiav') || url.includes('api.soiav'))) {
            return Promise.reject(new Error('Сервис Soiav отключён (EOL 2035)'));
        }
        return target.apply(thisArg, args);
    }
});
