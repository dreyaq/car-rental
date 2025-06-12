// Debug: App.js loaded
console.log('app.js файл загружен');

let app = null;

class App {
    constructor() {        this.sections = {
            home: document.getElementById('home-section'),
            cars: document.getElementById('cars-section'),
            rentals: document.getElementById('rentals-section'),
            profile: document.getElementById('profile-section'),
            myCars: document.getElementById('my-cars-section')
        };
          this.navLinks = {
            home: document.getElementById('nav-home'),
            cars: document.getElementById('nav-cars'),
            rentals: document.getElementById('nav-rentals'),
            profile: document.getElementById('nav-profile'),
            myCars: document.getElementById('nav-my-cars')
        };
        this.featuredCarsGrid = document.getElementById('featured-cars-grid');
        this.allCarsGrid = document.getElementById('all-cars-grid');
        this.carDetailModal = document.getElementById('car-detail-modal');
        this.carDetailContent = document.getElementById('car-detail-content');        this.rentalModal = document.getElementById('rental-modal');
        this.rentalCarInfo = document.getElementById('rental-car-info');
        this.rentalForm = document.getElementById('rental-form');        this.rentalDetailModal = document.getElementById('rental-detail-modal');
        this.rentalDetailContent = document.getElementById('rental-detail-content');
        this.priceFilter = document.getElementById('price-filter');
        this.priceFilterValue = document.getElementById('price-filter-value');
        this.brandFilter = document.getElementById('brand-filter');
        this.bodyTypeFilter = document.getElementById('body-type-filter');
        this.applyFiltersBtn = document.getElementById('apply-filters');
        this.browseCarsBtn = document.getElementById('browse-cars');
        this.tabs = document.querySelectorAll('.tab-btn');
        this.rentalsList = document.getElementById('rentals-list');
        this.profileForm = document.getElementById('profile-form');
        this.passwordForm = document.getElementById('password-form');
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.loadFeaturedCars();
        this.loadAllCars();
        this.setupCarFilters();
        this.setupCarDetailModal();
        this.setupRentalModal();
        this.setupRentalsTabs();
        this.setupProfileForms();
        this.setupCarManagement();
          document.addEventListener('userLoggedIn', () => {
            console.log("User logged in event received");
            this.refreshElements();
            // Дополнительная инициализация для владельцев после входа
            setTimeout(() => {
                this.initializeOwnerControls();
            }, 200);
        });
    }
    
    refreshElements() {
        console.log("Refreshing page elements");        this.sections = {
            home: document.getElementById('home-section'),
            cars: document.getElementById('cars-section'),
            rentals: document.getElementById('rentals-section'),
            profile: document.getElementById('profile-section'),
            myCars: document.getElementById('my-cars-section')
        };
        
        this.navLinks = {
            home: document.getElementById('nav-home'),
            cars: document.getElementById('nav-cars'),
            rentals: document.getElementById('nav-rentals'),
            profile: document.getElementById('nav-profile'),
            myCars: document.getElementById('nav-my-cars')
        };
        
        this.refreshCarManagementElements();
    }
      refreshCarManagementElements() {
        console.log("Refreshing car management elements");
        this.carFormModal = document.getElementById('car-form-modal');
        this.carForm = document.getElementById('car-form');
        this.addCarBtn = document.getElementById('add-car-btn');
        this.ownerCarsGrid = document.getElementById('owner-cars-grid');
        this.cancelCarFormBtn = document.getElementById('cancel-car-form');
        
        // Повторно привязываем обработчики после обновления элементов
        this.setupCarManagementEventListeners();
    }    setupNavigation() {
        this.navLinks.home.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('home'); });
        this.navLinks.cars.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('cars'); });
        this.navLinks.rentals.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('rentals'); });
        this.navLinks.profile.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('profile'); });
        this.navLinks.myCars.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('myCars'); });
        
        if (this.browseCarsBtn) {
            this.browseCarsBtn.addEventListener('click', () => this.navigateTo('cars'));
        }
    }
    
    navigateTo(section) {
        Object.values(this.sections).forEach(section => section.classList.add('hidden'));
        
        if (this.sections[section]) {
            this.sections[section].classList.remove('hidden');
            
            Object.values(this.navLinks).forEach(link => link.classList.remove('active'));
            
            if (this.navLinks[section]) {
                this.navLinks[section].classList.add('active');
            }            if (section === 'cars') {
                this.loadAllCars();
            } else if (section === 'rentals' && window.auth && window.auth.user) {
                this.loadRentals();
            } else if (section === 'profile' && window.auth && window.auth.user) {
                this.loadUserProfile();
            } else if (section === 'myCars' && window.auth && window.auth.user && window.auth.user.role === 'owner') {
                this.loadOwnerCars();
                // Переинициализируем элементы управления автомобилями
                setTimeout(() => {
                    this.refreshCarManagementElements();
                    this.initializeOwnerControls();
                }, 100);
            }
        }
    }    setupCarManagement() {
        console.log("Setting up car management");
        
        // Попробуем найти элементы, но не будем останавливать выполнение если их нет
        this.findCarManagementElements();
        
        // Настройка обработчиков для всех найденных элементов
        this.setupCarManagementEventListeners();
        
        // Настройка обработчиков для ценовых полей
        this.setupPriceCalculation();
          // Image handlers removed - no longer needed
    }
      findCarManagementElements() {
        console.log("Finding car management elements...");
        this.carFormModal = document.getElementById('car-form-modal');
        this.carForm = document.getElementById('car-form');
        this.addCarBtn = document.getElementById('add-car-btn');
        this.ownerCarsGrid = document.getElementById('owner-cars-grid');
        this.cancelCarFormBtn = document.getElementById('cancel-car-form');

        console.log("Car management elements found:", {
            carFormModal: !!this.carFormModal,
            carForm: !!this.carForm,
            addCarBtn: !!this.addCarBtn,
            ownerCarsGrid: !!this.ownerCarsGrid,
            cancelCarFormBtn: !!this.cancelCarFormBtn
        });
        
        if (this.addCarBtn) {
            console.log("Add car button element:", this.addCarBtn);
            console.log("Add car button is visible:", !this.addCarBtn.offsetParent === null);
        }
    }setupCarManagementEventListeners() {
        console.log("Setting up car management event listeners");
        
        // Привязываем обработчик для кнопки добавления автомобиля
        if (this.addCarBtn) {
            console.log("Привязка обработчика для кнопки добавления автомобиля");
            // Удаляем старый обработчик, если он есть
            if (this.addCarBtnHandler) {
                this.addCarBtn.removeEventListener('click', this.addCarBtnHandler);
            }
            // Создаем новый обработчик и сохраняем ссылку на него
            this.addCarBtnHandler = () => {
                console.log("Кнопка 'Добавить автомобиль' нажата");
                this.showAddCarForm();
            };
            this.addCarBtn.addEventListener('click', this.addCarBtnHandler);
            console.log("Event listener for add car button attached");
        } else {
            console.warn("Кнопка 'Добавить автомобиль' не найдена при инициализации");
        }
        
        // Привязываем обработчик для формы автомобиля
        if (this.carForm) {
            this.carForm.removeEventListener('submit', this.carFormHandler);
            this.carFormHandler = (e) => {
                e.preventDefault();
                this.handleCarFormSubmit();
            };
            this.carForm.addEventListener('submit', this.carFormHandler);
        }
        
        // Привязываем обработчик для кнопки отмены
        if (this.cancelCarFormBtn) {
            this.cancelCarFormBtn.removeEventListener('click', this.cancelCarFormHandler);            this.cancelCarFormHandler = () => {
                this.carFormModal.classList.add('hidden');
            };
            this.cancelCarFormBtn.addEventListener('click', this.cancelCarFormHandler);
        }
        
        // Привязываем обработчик для закрытия модального окна
        if (this.carFormModal) {
            const closeBtn = this.carFormModal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.removeEventListener('click', this.closeModalHandler);                this.closeModalHandler = () => {
                    this.carFormModal.classList.add('hidden');
                };
                closeBtn.addEventListener('click', this.closeModalHandler);
            }
            
            // Обработчик клика по фону модального окна (только один раз)
            if (!this.modalClickHandlerAdded) {                window.addEventListener('click', (e) => {
                    if (e.target === this.carFormModal) {
                        this.carFormModal.classList.add('hidden');
                    }
                });
                this.modalClickHandlerAdded = true;
            }
        }
    }
    
    setupPriceCalculation() {

        const pricePerDayInput = document.getElementById('car-price-day');
        const pricePerWeekInput = document.getElementById('car-price-week');
        const pricePerMonthInput = document.getElementById('car-price-month');
        
        if (pricePerDayInput && pricePerWeekInput && pricePerMonthInput) {
            pricePerDayInput.addEventListener('input', () => {
                const dayPrice = parseFloat(pricePerDayInput.value) || 0;
                pricePerWeekInput.value = Math.round(dayPrice * 7 * 0.9);
                pricePerMonthInput.value = Math.round(dayPrice * 30 * 0.8); 
            });
        }    }

    createOwnerCarCard(car) {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <div class="car-info">
                <div class="car-title">${car.brand} ${car.model} (${car.year})</div>
                <div class="car-price">${car.pricePerDay} ₽/день</div>
                <div class="status-badge ${car.isAvailable ? 'badge-success' : 'badge-danger'}">
                    ${car.isAvailable ? 'Доступен' : 'Недоступен'}
                </div>
                <div class="car-actions">
                    <button class="btn btn-edit" data-id="${car.id}">Редактировать</button>
                    <button class="btn btn-danger" data-id="${car.id}">Удалить</button>
                </div>
            </div>
        `;
        
        card.querySelector('.btn-edit').addEventListener('click', () => this.showEditCarForm(car.id));
        card.querySelector('.btn-danger').addEventListener('click', () => this.deleteCar(car.id));
        
        return card;
    }

    showAddCarForm() {
        console.log("Showing add car form");
        
        // Переинициализируем элементы если они отсутствуют
        if (!this.carFormModal) {
            this.carFormModal = document.getElementById('car-form-modal');
        }
        if (!this.carForm) {
            this.carForm = document.getElementById('car-form');
        }
        
        if (!this.carFormModal || !this.carForm) {
            console.error("Car form modal or form not found");
            alert("Ошибка: не удалось найти форму добавления автомобиля");
            return;
        }
        
        // Установка заголовка и очистка формы
        const titleElement = document.getElementById('car-form-title');
        if (titleElement) {
            titleElement.textContent = 'Добавить автомобиль';
        }
        
        const carIdElement = document.getElementById('car-id');
        if (carIdElement) {
            carIdElement.value = '';
        }
          this.carForm.reset();
        this.carFormModal.classList.remove('hidden');
        
        console.log("Add car form shown successfully");
    }
    
    async showEditCarForm(carId) {
        try {
            document.getElementById('car-form-title').textContent = 'Редактировать автомобиль';
            console.log("Загрузка данных автомобиля для редактирования, ID:", carId);
            const response = await window.api.getOwnerCarById(carId);
            const car = response.car ? response.car : response;
            
            console.log("Полученные данные автомобиля:", car);
            
            document.getElementById('car-id').value = car.id;
            document.getElementById('car-brand').value = car.brand;
            document.getElementById('car-model').value = car.model;
            document.getElementById('car-year').value = car.year;
            document.getElementById('car-registration').value = car.registrationNumber;
            document.getElementById('car-body-type').value = car.bodyType;
            document.getElementById('car-color').value = car.color;
            document.getElementById('car-seats').value = car.seats;
            document.getElementById('car-transmission').value = car.transmission;
            document.getElementById('car-fuel-type').value = car.fuelType;
            document.getElementById('car-fuel-consumption').value = car.fuelConsumption;
            document.getElementById('car-price-day').value = car.pricePerDay;
            document.getElementById('car-price-week').value = car.pricePerWeek || '';
            document.getElementById('car-price-month').value = car.pricePerMonth || '';
            document.getElementById('car-driver').checked = car.driverIncluded;
            document.getElementById('car-description').value = car.description || '';
            document.getElementById('car-available').checked = car.isAvailable;

            if (car.features && car.features.length) {
                const featureNames = car.features.map(f => f.name).join(', ');
                document.getElementById('car-features').value = featureNames;            } else {
                document.getElementById('car-features').value = '';
            }
            
            this.carFormModal.classList.remove('hidden');
        } catch (e) {
            alert('Не удалось загрузить данные автомобиля');
            console.error('Error loading car for edit:', e);
        }
    }

    async handleCarFormSubmit() {
        try {
            console.log("Handling car form submit");
            
            const carId = document.getElementById('car-id').value;
            const isNewCar = !carId;
            
            const carData = {
                brand: document.getElementById('car-brand').value,
                model: document.getElementById('car-model').value,
                year: parseInt(document.getElementById('car-year').value),
                registrationNumber: document.getElementById('car-registration').value,
                bodyType: document.getElementById('car-body-type').value,
                color: document.getElementById('car-color').value,
                seats: parseInt(document.getElementById('car-seats').value),
                transmission: document.getElementById('car-transmission').value,
                fuelType: document.getElementById('car-fuel-type').value,
                fuelConsumption: parseFloat(document.getElementById('car-fuel-consumption').value),
                pricePerDay: parseFloat(document.getElementById('car-price-day').value),
                driverIncluded: document.getElementById('car-driver').checked,
                description: document.getElementById('car-description').value,
                isAvailable: document.getElementById('car-available').checked,
                doors: 4,
                category: document.getElementById('car-body-type').value,
                location: "Default Location"
            };
            
            // Add optional prices
            const weekPrice = document.getElementById('car-price-week').value;
            if (weekPrice && weekPrice.trim() !== '') {
                carData.pricePerWeek = parseFloat(weekPrice);
            }
            
            const monthPrice = document.getElementById('car-price-month').value;
            if (monthPrice && monthPrice.trim() !== '') {
                carData.pricePerMonth = parseFloat(monthPrice);            }
            
            let response;
            
            if (isNewCar) {
                console.log("Sending car data to API:", JSON.stringify(carData, null, 2));
                response = await window.api.createCar(carData);
                console.log("Car creation response:", response);
                alert('Автомобиль успешно добавлен!');
            } else {
                console.log("Sending car update data to API:", JSON.stringify(carData, null, 2));
                response = await window.api.updateCar(carId, carData);
                console.log("Car update response:", response);
                alert('Информация об автомобиле обновлена!');
            }
            
            this.carFormModal.classList.add('hidden');
            this.loadOwnerCars();
            
        } catch (e) {
            let errorMessage = e.message || 'Не удалось сохранить данные автомобиля';

            if (errorMessage.includes('registrationNumber') && errorMessage.includes('unique')) {
                errorMessage = 'Этот регистрационный номер уже используется. Пожалуйста, укажите другой номер.';
            } else if (errorMessage.includes('Bad request')) {
                errorMessage = 'Ошибка в данных формы. Пожалуйста, проверьте все обязательные поля.';
            } else if (errorMessage.includes('Server error')) {
                errorMessage = 'Ошибка на сервере. Пожалуйста, попробуйте позже.';
            }
            
            alert(`Ошибка: ${errorMessage}`);
            console.error('Error submitting car form:', e);
        }
    }

    async deleteCar(carId) {
        if (!confirm('Вы действительно хотите удалить этот автомобиль?')) return;
        
        try {
            await window.api.deleteCar(carId);
            alert('Автомобиль удален');
            this.loadOwnerCars();
        } catch (e) {
            alert(`Ошибка: ${e.message || 'Не удалось удалить автомобиль'}`);
            console.error('Error deleting car:', e);
        }
    }
    
    async loadFeaturedCars() {
        try {
            console.log("Loading featured cars");
            if (!this.featuredCarsGrid) {
                console.warn("Featured cars grid element not found");
                return;
            }
            
            const response = await window.api.getCars({ isAvailable: true });
            console.log("Featured cars API response:", response);
            
            const cars = response.cars || [];
            if (!cars.length) {
                this.featuredCarsGrid.innerHTML = '<p class="empty-message">Нет доступных автомобилей</p>';
                return;
            }
            
            // Show max 4 featured cars
            const featuredCars = cars.slice(0, 4);
            this.featuredCarsGrid.innerHTML = '';
            
            featuredCars.forEach(car => {
                const card = this.createCarCard(car);
                this.featuredCarsGrid.appendChild(card);
            });
        } catch (error) {
            console.error("Error loading featured cars:", error);
            this.featuredCarsGrid.innerHTML = '<p class="error-message">Ошибка загрузки автомобилей</p>';
        }
    }
    
    async loadAllCars(filters = {}) {
        try {
            console.log("Loading all available cars with filters:", filters);
            if (!this.allCarsGrid) {
                console.warn("All cars grid element not found");
                return;
            }
            
            const response = await window.api.getCars({ isAvailable: true, ...filters });
            console.log("All cars API response:", response);
            
            const cars = response.cars || [];
            if (!cars.length) {
                this.allCarsGrid.innerHTML = '<p class="empty-message">Нет доступных автомобилей</p>';
                return;
            }
            
            this.allCarsGrid.innerHTML = '';
            
            cars.forEach(car => {
                const card = this.createCarCard(car);
                this.allCarsGrid.appendChild(card);
            });
        } catch (error) {
            console.error("Error loading all cars:", error);
            this.allCarsGrid.innerHTML = '<p class="error-message">Ошибка загрузки автомобилей</p>';
        }
    }
      createCarCard(car) {
        const card = document.createElement('div');
        card.className = 'car-card';
        
        // Format features for display
        let featuresHtml = '';
        if (car.features && car.features.length) {
            featuresHtml = car.features.slice(0, 3).map(feature => 
                `<span class="car-feature">${feature.name}</span>`
            ).join('');
        }
        
        card.innerHTML = `
            <div class="car-info">
                <div class="car-title">${car.brand} ${car.model} (${car.year})</div>
                <div class="car-price">${car.pricePerDay} ₽/день</div>
                <div class="car-features">
                    ${featuresHtml}
                </div>
                <div class="car-actions">
                    <button class="btn btn-primary view-details" data-id="${car.id}">Подробнее</button>
                </div>
            </div>
        `;
        
        card.querySelector('.view-details').addEventListener('click', () => this.showCarDetails(car.id));
        
        return card;
    }
    
    setupCarFilters() {
        if (!this.priceFilter || !this.priceFilterValue || !this.applyFiltersBtn) {
            console.warn("Car filter elements not found");
            return;
        }
        
        // Update the price filter display when the slider is moved
        this.priceFilter.addEventListener('input', () => {
            this.priceFilterValue.textContent = `${this.priceFilter.value} ₽`;
        });
        
        this.loadBrandFilter();
        
        this.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
    }
    
    async loadBrandFilter() {
        try {
            if (!this.brandFilter) return;
            
            const response = await window.api.getCars();
            const cars = response.cars || [];
            
            if (cars.length) {
                // Extract unique brands
                const brands = [...new Set(cars.map(car => car.brand))].sort();
                
                // Add brand options to select
                brands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand;
                    option.textContent = brand;
                    this.brandFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error loading brand filter:", error);
        }
    }
    
    applyFilters() {
        const filters = {};
        
        if (this.brandFilter && this.brandFilter.value) {
            filters.brand = this.brandFilter.value;
        }
        
        if (this.bodyTypeFilter && this.bodyTypeFilter.value) {
            filters.bodyType = this.bodyTypeFilter.value;
        }
        
        if (this.priceFilter) {
            filters.maxPrice = this.priceFilter.value;
        }
        
        this.loadAllCars(filters);
    }
    
    setupCarDetailModal() {
        if (!this.carDetailModal) return;
        
        const closeBtn = this.carDetailModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.carDetailModal.classList.add('hidden');
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.carDetailModal) {
                this.carDetailModal.classList.add('hidden');
            }
        });
    }
      async showCarDetails(carId) {
        try {
            console.log("Loading car details for:", carId);
            
            if (!this.carDetailModal || !this.carDetailContent) {
                console.error("Car detail modal elements not found");
                alert("Ошибка: не удалось найти модальное окно деталей");
                return;
            }

            // Показать загрузку
            this.carDetailContent.innerHTML = '<div class="loading">Загрузка...</div>';
            this.carDetailModal.classList.remove('hidden');

            // Получить данные автомобиля
            const response = await window.api.getCarById(carId);
            const car = response.car ? response.car : response;
            
            console.log("Car details loaded:", car);            // Отформатировать особенности
            let featuresHtml = '<p>Не указаны</p>';
            if (car.features && car.features.length) {
                featuresHtml = '<ul>' + car.features.map(feature => 
                    `<li>${feature.name}</li>`
                ).join('') + '</ul>';
            }

            // Создать HTML для деталей автомобиля
            this.carDetailContent.innerHTML = `
                <div class="car-detail-header">
                    <h2>${car.brand} ${car.model} (${car.year})</h2>
                    <div class="car-status ${car.isAvailable ? 'available' : 'unavailable'}">
                        ${car.isAvailable ? 'Доступен' : 'Недоступен'}
                    </div>
                </div>
                  <div class="car-detail-body">
                    <div class="car-detail-info">
                        <div class="info-section">
                            <h3>Основная информация</h3>
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="label">Марка:</span>
                                    <span class="value">${car.brand}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Модель:</span>
                                    <span class="value">${car.model}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Год:</span>
                                    <span class="value">${car.year}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Тип кузова:</span>
                                    <span class="value">${car.bodyType}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Цвет:</span>
                                    <span class="value">${car.color}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Места:</span>
                                    <span class="value">${car.seats}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Трансмиссия:</span>
                                    <span class="value">${car.transmission}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Тип топлива:</span>
                                    <span class="value">${car.fuelType}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Расход топлива:</span>
                                    <span class="value">${car.fuelConsumption} л/100км</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">Водитель включен:</span>
                                    <span class="value">${car.driverIncluded ? 'Да' : 'Нет'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="info-section">
                            <h3>Цены</h3>
                            <div class="price-info">
                                <div class="price-item">
                                    <span class="price-label">За день:</span>
                                    <span class="price-value">${car.pricePerDay} ₽</span>
                                </div>
                                ${car.pricePerWeek ? `
                                    <div class="price-item">
                                        <span class="price-label">За неделю:</span>
                                        <span class="price-value">${car.pricePerWeek} ₽</span>
                                    </div>
                                ` : ''}
                                ${car.pricePerMonth ? `
                                    <div class="price-item">
                                        <span class="price-label">За месяц:</span>
                                        <span class="price-value">${car.pricePerMonth} ₽</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        ${car.description ? `
                            <div class="info-section">
                                <h3>Описание</h3>
                                <p>${car.description}</p>
                            </div>
                        ` : ''}

                        <div class="info-section">
                            <h3>Особенности</h3>
                            ${featuresHtml}
                        </div>

                        ${car.isAvailable && window.auth && window.auth.user && window.auth.user.role === 'tenant' ? `
                            <div class="car-actions">
                                <button class="btn btn-primary rent-car-btn" data-car-id="${car.id}">
                                    Арендовать
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Привязать обработчик для кнопки аренды
            const rentBtn = this.carDetailContent.querySelector('.rent-car-btn');
            if (rentBtn) {
                rentBtn.addEventListener('click', () => {
                    this.carDetailModal.classList.add('hidden');
                    this.showRentalModal(car);
                });
            }        } catch (error) {
            console.error("Error loading car details:", error);
            this.carDetailContent.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить детали автомобиля: ${error.message}</p>
                </div>
            `;
        }    }
    
    setupRentalModal() {
        console.log("Setting up rental modal");
        
        if (!this.rentalModal) {
            console.warn("Rental modal not found");
            return;
        }
        
        // Настройка закрытия модального окна
        const closeBtn = this.rentalModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.rentalModal.classList.add('hidden');
            });
        }
        
        // Закрытие по клику на фон
        window.addEventListener('click', (e) => {
            if (e.target === this.rentalModal) {
                this.rentalModal.classList.add('hidden');
            }
        });
        
        // Настройка формы аренды
        if (this.rentalForm) {
            this.rentalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRentalSubmit();
            });
        }
        
        // Настройка расчета цены при изменении дат
        const startDateInput = document.getElementById('rental-start-date');
        const endDateInput = document.getElementById('rental-end-date');
        const withDriverCheckbox = document.getElementById('rental-with-driver');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.calculateRentalPrice());
            endDateInput.addEventListener('change', () => this.calculateRentalPrice());
        }
        
        if (withDriverCheckbox) {
            withDriverCheckbox.addEventListener('change', () => this.calculateRentalPrice());
        }
    }
      showRentalModal(car) {
        console.log("Show rental modal for car:", car.brand, car.model);
        
        if (!this.rentalModal || !this.rentalCarInfo) {
            console.error("Rental modal elements not found");
            alert("Ошибка: не удалось найти форму аренды");
            return;
        }
        
        // Проверяем, что пользователь авторизован и является арендатором
        if (!window.auth || !window.auth.user) {
            alert("Для аренды автомобиля необходимо войти в систему");
            return;
        }
        
        if (window.auth.user.role !== 'tenant') {
            alert("Арендовать автомобили могут только арендаторы");
            return;
        }
        
        // Сохраняем информацию о выбранном автомобиле
        this.selectedCar = car;
        
        // Заполняем информацию об автомобиле
        this.rentalCarInfo.innerHTML = `
            <div class="rental-car-summary">
                <h3>${car.brand} ${car.model} (${car.year})</h3>
                <div class="car-details">
                    <p><strong>Тип кузова:</strong> ${car.bodyType}</p>
                    <p><strong>Цвет:</strong> ${car.color}</p>
                    <p><strong>Места:</strong> ${car.seats}</p>
                    <p><strong>Трансмиссия:</strong> ${car.transmission}</p>
                    <p><strong>Топливо:</strong> ${car.fuelType}</p>
                    <p><strong>Цена за день:</strong> ${car.pricePerDay} ₽</p>
                    ${car.driverIncluded ? '<p><strong>Возможна аренда с водителем</strong></p>' : ''}
                </div>
            </div>
        `;
        
        // Устанавливаем ID автомобиля в скрытое поле
        const carIdInput = document.getElementById('rental-car-id');
        if (carIdInput) {
            carIdInput.value = car.id;
        }
        
        // Устанавливаем минимальную дату (сегодня)
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('rental-start-date');
        const endDateInput = document.getElementById('rental-end-date');
        
        if (startDateInput) {
            startDateInput.min = today;
            startDateInput.value = '';
        }
        if (endDateInput) {
            endDateInput.min = today;
            endDateInput.value = '';
        }
        
        // Показываем/скрываем опцию с водителем
        const withDriverGroup = document.getElementById('rental-with-driver').parentElement;
        if (car.driverIncluded) {
            withDriverGroup.style.display = 'block';
        } else {
            withDriverGroup.style.display = 'none';
            document.getElementById('rental-with-driver').checked = false;
        }
        
        // Очищаем форму
        this.rentalForm.reset();
        document.getElementById('rental-car-id').value = car.id;
        
        // Очищаем цену
        const totalPriceElement = document.getElementById('rental-total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = '0 ₽';
        }
        
        // Показываем модальное окно
        this.rentalModal.classList.remove('hidden');
    }

    calculateRentalPrice() {
        if (!this.selectedCar) return;
        
        const startDateInput = document.getElementById('rental-start-date');
        const endDateInput = document.getElementById('rental-end-date');
        const withDriverCheckbox = document.getElementById('rental-with-driver');
        const totalPriceElement = document.getElementById('rental-total-price');
        
        if (!startDateInput.value || !endDateInput.value) {
            totalPriceElement.textContent = '0 ₽';
            return;
        }
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate <= startDate) {
            totalPriceElement.textContent = 'Неверные даты';
            return;
        }
        
        // Рассчитываем количество дней
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let totalPrice = diffDays * this.selectedCar.pricePerDay;
        
        // Добавляем стоимость водителя (если выбрано)
        if (withDriverCheckbox.checked && this.selectedCar.driverIncluded) {
            // Предполагаем, что водитель стоит дополнительно 1000₽ в день
            totalPrice += diffDays * 1000;
        }
        
        totalPriceElement.textContent = `${totalPrice} ₽ (${diffDays} дн.)`;
    }
    
    async handleRentalSubmit() {
        try {
            console.log("Handling rental form submit");
            
            if (!this.selectedCar) {
                alert("Ошибка: автомобиль не выбран");
                return;
            }
            
            const formData = new FormData(this.rentalForm);
            const rentalData = {
                carId: formData.get('carId'),
                startDate: formData.get('startDate'),
                endDate: formData.get('endDate'),
                withDriver: formData.get('withDriver') === 'on',
                pickupLocation: formData.get('pickupLocation'),
                returnLocation: formData.get('returnLocation'),
                notes: formData.get('notes') || ''
            };
            
            // Валидация дат
            const startDate = new Date(rentalData.startDate);
            const endDate = new Date(rentalData.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                alert("Дата начала аренды не может быть в прошлом");
                return;
            }
            
            if (endDate <= startDate) {
                alert("Дата окончания должна быть позже даты начала");
                return;
            }
            
            // Проверяем обязательные поля
            if (!rentalData.pickupLocation.trim()) {
                alert("Укажите место получения автомобиля");
                return;
            }
            
            if (!rentalData.returnLocation.trim()) {
                alert("Укажите место возврата автомобиля");
                return;
            }
            
            console.log("Sending rental data:", rentalData);
            
            const response = await window.api.createRental(rentalData);
            console.log("Rental creation response:", response);
            
            alert("Заявка на аренду успешно отправлена! Ожидайте подтверждения.");
            
            // Закрываем модальное окно
            this.rentalModal.classList.add('hidden');
            
            // Переходим к разделу аренд
            this.navigateTo('rentals');
            
        } catch (error) {
            console.error("Error creating rental:", error);
            let errorMessage = error.message || 'Не удалось создать заявку на аренду';
            
            if (errorMessage.includes('Car is not available')) {
                errorMessage = 'Автомобиль недоступен для аренды в выбранные даты';
            } else if (errorMessage.includes('Invalid date range')) {
                errorMessage = 'Некорректный диапазон дат';
            }
              alert(`Ошибка: ${errorMessage}`);
        }
    }    setupRentalsTabs() {
        console.log("Setting up rental tabs");
        
        const tabButtons = document.querySelectorAll('.tab-btn');
        if (!tabButtons.length) {
            console.warn("Rental tab buttons not found");
            return;
        }
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс со всех кнопок
                tabButtons.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс к нажатой кнопке
                btn.classList.add('active');
                
                // Получаем тип вкладки и загружаем соответствующие аренды
                const tabType = btn.getAttribute('data-tab');
                this.loadRentalsByStatus(tabType);
            });
        });
        
        console.log("Rental tabs setup complete");
    }      async loadRentals() {
        console.log("Loading rentals section");
        
        if (!window.auth || !window.auth.user) {
            if (this.rentalsList) {
                this.rentalsList.innerHTML = '<p class="error-message">Необходимо войти в систему</p>';
            }
            return;
        }
        
        // Обновляем заголовок и вкладки в зависимости от роли пользователя
        this.setupRentalsInterface();
        
        if (window.auth.user.role === 'tenant') {
            // Для арендаторов загружаем их аренды
            this.loadRentalsByStatus('upcoming');
        } else if (window.auth.user.role === 'owner') {
            // Для владельцев загружаем заявки на аренду их автомобилей
            this.loadOwnerRentals();
        }
    }
    
    setupRentalsInterface() {
        const title = document.getElementById('rentals-title');
        const tenantTabs = document.getElementById('tenant-rental-tabs');
        const ownerTabs = document.getElementById('owner-rental-tabs');
        
        if (!title || !tenantTabs || !ownerTabs) {
            console.warn("Rentals interface elements not found");
            return;
        }
        
        if (window.auth.user.role === 'tenant') {
            title.textContent = 'Мои аренды';
            tenantTabs.classList.remove('hidden');
            ownerTabs.classList.add('hidden');
            this.setupTenantRentalsTabs();
        } else if (window.auth.user.role === 'owner') {
            title.textContent = 'Заявки на аренду';
            tenantTabs.classList.add('hidden');
            ownerTabs.classList.remove('hidden');
            this.setupOwnerRentalsTabs();
        }
    }
    
    async loadRentalsByStatus(status) {
        try {
            console.log("Loading rentals by status:", status);
            
            if (!this.rentalsList) {
                console.warn("Rentals list element not found");
                return;
            }
            
            if (!window.auth || !window.auth.user) {
                this.rentalsList.innerHTML = '<p class="error-message">Необходимо войти в систему</p>';
                return;
            }
            
            // Показываем загрузку
            this.rentalsList.innerHTML = '<div class="loading">Загрузка аренд...</div>';
            
            const response = await window.api.getRentals();
            console.log("Rentals response:", response);
            
            const allRentals = response.rentals || [];
            
            // Фильтруем аренды по статусу
            let filteredRentals = [];
            const now = new Date();
            
            switch (status) {
                case 'upcoming':
                    filteredRentals = allRentals.filter(rental => 
                        ['pending', 'confirmed'].includes(rental.status) && 
                        new Date(rental.startDate) > now
                    );
                    break;
                case 'active':
                    filteredRentals = allRentals.filter(rental => 
                        rental.status === 'active' || 
                        (rental.status === 'confirmed' && 
                         new Date(rental.startDate) <= now && 
                         new Date(rental.endDate) >= now)
                    );
                    break;
                case 'completed':
                    filteredRentals = allRentals.filter(rental => 
                        ['completed', 'cancelled'].includes(rental.status) || 
                        (rental.status === 'confirmed' && new Date(rental.endDate) < now)
                    );
                    break;
                default:
                    filteredRentals = allRentals;
            }
            
            if (!filteredRentals.length) {
                const statusLabels = {
                    'upcoming': 'предстоящих',
                    'active': 'активных', 
                    'completed': 'завершенных'
                };
                this.rentalsList.innerHTML = `<p class="empty-message">У вас пока нет ${statusLabels[status] || ''} аренд</p>`;
                return;
            }
            
            // Очищаем список
            this.rentalsList.innerHTML = '';
            
            // Создаем карточки аренд
            filteredRentals.forEach(rental => {
                const rentalCard = this.createRentalCard(rental);
                this.rentalsList.appendChild(rentalCard);
            });
            
        } catch (error) {
            console.error("Error loading rentals:", error);
            this.rentalsList.innerHTML = `<p class="error-message">Ошибка загрузки аренд: ${error.message}</p>`;
        }
    }
    
    createRentalCard(rental) {
        const card = document.createElement('div');
        card.className = 'rental-card';
        
        // Форматируем даты
        const startDate = new Date(rental.startDate).toLocaleDateString('ru-RU');
        const endDate = new Date(rental.endDate).toLocaleDateString('ru-RU');
        
        // Определяем статус на русском
        const statusLabels = {
            'pending': 'Ожидает подтверждения',
            'confirmed': 'Подтверждена',
            'active': 'Активна',
            'completed': 'Завершена',
            'cancelled': 'Отменена'
        };
        
        const statusLabel = statusLabels[rental.status] || rental.status;
        const statusClass = `status-${rental.status}`;
        
        card.innerHTML = `
            <div class="rental-header">
                <h3>${rental.car.brand} ${rental.car.model} (${rental.car.year})</h3>
                <span class="rental-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="rental-details">
                <div class="rental-dates">
                    <p><strong>Период:</strong> ${startDate} - ${endDate}</p>
                </div>
                <div class="rental-locations">
                    <p><strong>Получение:</strong> ${rental.pickupLocation}</p>
                    <p><strong>Возврат:</strong> ${rental.returnLocation}</p>
                </div>
                ${rental.withDriver ? '<p><strong>С водителем</strong></p>' : ''}
                ${rental.totalPrice ? `<p class="rental-cost"><strong>Стоимость:</strong> ${rental.totalPrice} ₽</p>` : ''}
                ${rental.notes ? `<p><strong>Примечания:</strong> ${rental.notes}</p>` : ''}
            </div>
            <div class="rental-actions">
                <button class="btn btn-sm btn-info" onclick="app.showRentalDetails('${rental.id}')">Подробнее</button>
                ${rental.status === 'pending' ? `<button class="btn btn-sm btn-danger" onclick="app.cancelRental('${rental.id}')">Отменить</button>` : ''}
            </div>
        `;
        
        return card;
    }
      async showRentalDetails(rentalId) {
        try {
            console.log("Loading rental details for:", rentalId);
            
            if (!this.rentalDetailModal || !this.rentalDetailContent) {
                console.error("Rental detail modal elements not found");
                alert("Ошибка: не удалось найти модальное окно деталей");
                return;
            }
            
            // Показать загрузку
            this.rentalDetailContent.innerHTML = '<div class="loading">Загрузка деталей аренды...</div>';
            this.rentalDetailModal.classList.remove('hidden');
            
            const response = await window.api.getRentalById(rentalId);
            const rental = response.rental || response;
            
            // Форматируем даты
            const startDate = new Date(rental.startDate);
            const endDate = new Date(rental.endDate);
            const now = new Date();
            
            // Определяем статус на русском
            const statusLabels = {
                'pending': 'Ожидает подтверждения',
                'confirmed': 'Подтверждена',
                'active': 'Активна',
                'completed': 'Завершена',
                'cancelled': 'Отменена'
            };
            
            const statusLabel = statusLabels[rental.status] || rental.status;
            const statusClass = `status-${rental.status}`;
            
            // Рассчитываем количество дней
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Создаем HTML для деталей аренды
            this.rentalDetailContent.innerHTML = `
                <div class="rental-detail-header">
                    <div class="rental-car-info">
                        <h3>${rental.car.brand} ${rental.car.model} (${rental.car.year})</h3>
                        <p class="car-details">${rental.car.bodyType} • ${rental.car.color} • ${rental.car.seats} мест</p>
                    </div>
                    <div class="rental-status-badge ${statusClass}">
                        ${statusLabel}
                    </div>
                </div>
                
                <div class="rental-detail-body">
                    <div class="detail-section">
                        <h4>Период аренды</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Дата начала:</span>
                                <span class="detail-value">${startDate.toLocaleDateString('ru-RU')} в ${startDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Дата окончания:</span>
                                <span class="detail-value">${endDate.toLocaleDateString('ru-RU')} в ${endDate.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Продолжительность:</span>
                                <span class="detail-value">${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Локации</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Место получения:</span>
                                <span class="detail-value">${rental.pickupLocation}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Место возврата:</span>
                                <span class="detail-value">${rental.returnLocation}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>Дополнительные услуги</h4>
                        <div class="detail-item">
                            <span class="detail-label">Водитель:</span>
                            <span class="detail-value">${rental.withDriver ? 'Включен' : 'Не включен'}</span>
                        </div>
                    </div>
                      ${rental.totalPrice ? `
                        <div class="detail-section">
                            <h4>Стоимость</h4>
                            <div class="cost-breakdown">
                                <div class="cost-item">
                                    <span>Аренда автомобиля (${diffDays} дн. × ${rental.car.pricePerDay} ₽):</span>
                                    <span>${diffDays * rental.car.pricePerDay} ₽</span>
                                </div>
                                ${rental.withDriver ? `
                                    <div class="cost-item">
                                        <span>Водитель (${diffDays} дн. × 1000 ₽):</span>
                                        <span>${diffDays * 1000} ₽</span>
                                    </div>
                                ` : ''}
                                <div class="cost-total">
                                    <span><strong>Итого:</strong></span>
                                    <span><strong>${rental.totalPrice} ₽</strong></span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${rental.notes ? `
                        <div class="detail-section">
                            <h4>Примечания</h4>
                            <p class="notes">${rental.notes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="rental-detail-actions">
                        ${rental.status === 'pending' ? `
                            <button class="btn btn-danger" onclick="app.cancelRental('${rental.id}')">
                                Отменить аренду
                            </button>
                        ` : ''}
                        ${rental.status === 'confirmed' && startDate > now ? `
                            <button class="btn btn-secondary" onclick="app.editRental('${rental.id}')">
                                Изменить детали
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Настраиваем закрытие модального окна
            this.setupRentalDetailModal();
            
        } catch (error) {
            console.error("Error loading rental details:", error);
            this.rentalDetailContent.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить детали аренды: ${error.message}</p>
                </div>
            `;        }
    }
    
    setupRentalDetailModal() {
        if (!this.rentalDetailModal) return;
        
        const closeBtn = this.rentalDetailModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.rentalDetailModal.classList.add('hidden');
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.rentalDetailModal) {
                this.rentalDetailModal.classList.add('hidden');
            }
        });
    }
      async cancelRental(rentalId) {
        if (!confirm("Вы действительно хотите отменить эту аренду?")) {
            return;
        }
        
        try {
            await window.api.updateRentalStatus(rentalId, 'cancelled');
            alert("Аренда отменена");
            
            // Закрываем модальное окно деталей, если оно открыто
            if (this.rentalDetailModal) {
                this.rentalDetailModal.classList.add('hidden');
            }
            
            // Получаем активную вкладку и перезагружаем соответствующие аренды
            const activeTab = document.querySelector('.tab-btn.active');
            const currentStatus = activeTab ? activeTab.getAttribute('data-tab') : 'upcoming';
            this.loadRentalsByStatus(currentStatus);
            
        } catch (error) {
            console.error("Error cancelling rental:", error);
            alert(`Ошибка отмены аренды: ${error.message}`);
        }
    }

    setupProfileForms() {
        console.log("Setting up profile forms");
        // Заглушка для настройки форм профиля
    }
    
    async loadUserProfile() {
        console.log("Loading user profile");
        // Заглушка для загрузки профиля пользователя
    }

    async loadOwnerCars() {
        try {
            console.log("Loading owner cars");
            
            if (!this.ownerCarsGrid) {
                console.warn("Owner cars grid element not found");
                return;
            }
            
            if (!window.auth || !window.auth.user || window.auth.user.role !== 'owner') {
                this.ownerCarsGrid.innerHTML = '<p class="error-message">Доступ запрещен</p>';
                return;
            }
            
            // Показываем загрузку
            this.ownerCarsGrid.innerHTML = '<div class="loading">Загрузка автомобилей...</div>';
            
            const response = await window.api.getOwnerCars();
            console.log("Owner cars response:", response);
            
            const cars = response.cars || [];
            
            if (!cars.length) {
                this.ownerCarsGrid.innerHTML = '<p class="empty-message">У вас пока нет автомобилей. <a href="#" onclick="app.showAddCarForm()">Добавить первый автомобиль</a></p>';
                return;
            }
            
            // Очищаем список
            this.ownerCarsGrid.innerHTML = '';
            
            // Создаем карточки автомобилей
            cars.forEach(car => {
                const carCard = this.createOwnerCarCard(car);
                this.ownerCarsGrid.appendChild(carCard);
            });
            
        } catch (error) {
            console.error("Error loading owner cars:", error);
            this.ownerCarsGrid.innerHTML = `<p class="error-message">Ошибка загрузки автомобилей: ${error.message}</p>`;
        }
    }
      // Owner rental management methods
    async loadOwnerRentals() {
        try {
            console.log("Loading owner rentals");
            
            if (!this.rentalsList) {
                console.warn("Rentals list element not found");
                return;
            }
            
            if (!window.auth || !window.auth.user || window.auth.user.role !== 'owner') {
                this.rentalsList.innerHTML = '<p class="error-message">Доступ запрещен</p>';
                return;
            }
            
            // Показываем загрузку
            this.rentalsList.innerHTML = '<div class="loading">Загрузка заявок на аренду...</div>';
            
            const response = await window.api.getOwnerRentals();
            console.log("Owner rentals response:", response);
            
            const rentals = response.rentals || [];
            
            if (!rentals.length) {
                this.rentalsList.innerHTML = '<p class="empty-message">Заявок на аренду пока нет</p>';
                return;
            }
            
            // По умолчанию показываем ожидающие заявки
            this.loadOwnerRentalsByStatus('pending', rentals);
            
        } catch (error) {
            console.error("Error loading owner rentals:", error);
            this.rentalsList.innerHTML = `<p class="error-message">Ошибка загрузки заявок: ${error.message}</p>`;
        }
    }
    
    setupTenantRentalsTabs() {
        console.log("Setting up tenant rental tabs");
        
        const tabButtons = document.querySelectorAll('#tenant-rental-tabs .tab-btn');
        if (!tabButtons.length) {
            console.warn("Tenant rental tab buttons not found");
            return;
        }
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс со всех кнопок
                tabButtons.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс к нажатой кнопке
                btn.classList.add('active');
                
                // Получаем тип вкладки и загружаем соответствующие аренды
                const tabType = btn.getAttribute('data-tab');
                this.loadRentalsByStatus(tabType);
            });
        });
        
        console.log("Tenant rental tabs setup complete");
    }
      setupOwnerRentalsTabs() {
        console.log("Setting up owner rental tabs");
        
        const tabButtons = document.querySelectorAll('#owner-rental-tabs .tab-btn');
        if (!tabButtons.length) {
            console.warn("Owner rental tab buttons not found");
            return;
        }
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Убираем активный класс со всех кнопок
                tabButtons.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс к нажатой кнопке
                btn.classList.add('active');
                
                // Получаем тип вкладки и загружаем соответствующие аренды
                const tabType = btn.getAttribute('data-tab');
                
                try {
                    const response = await window.api.getOwnerRentals();
                    const allRentals = response.rentals || [];
                    this.loadOwnerRentalsByStatus(tabType, allRentals);
                } catch (error) {
                    console.error("Error loading owner rentals by status:", error);
                    this.rentalsList.innerHTML = `<p class="error-message">Ошибка загрузки: ${error.message}</p>`;
                }
            });
        });
        
        console.log("Owner rental tabs setup complete");
    }
      loadOwnerRentalsByStatus(status, allRentals = []) {
        console.log("Loading owner rentals by status:", status);
        
        if (!this.rentalsList) {
            console.warn("Rentals list element not found");
            return;
        }
        
        // Фильтруем аренды по статусу
        let filteredRentals = [];
        
        switch (status) {
            case 'pending':
                filteredRentals = allRentals.filter(rental => rental.status === 'pending');
                break;
            case 'confirmed':
                filteredRentals = allRentals.filter(rental => 
                    ['confirmed', 'active'].includes(rental.status)
                );
                break;
            case 'all':
                filteredRentals = allRentals;
                break;
            default:
                filteredRentals = allRentals;
        }
        
        if (!filteredRentals.length) {
            const statusLabels = {
                'pending': 'ожидающих',
                'confirmed': 'подтвержденных',
                'all': ''
            };
            this.rentalsList.innerHTML = `<p class="empty-message">Нет ${statusLabels[status]} заявок на аренду</p>`;
            return;
        }
        
        // Очищаем список
        this.rentalsList.innerHTML = '';
        
        // Создаем карточки заявок
        filteredRentals.forEach(rental => {
            const rentalCard = this.createOwnerRentalCard(rental);
            this.rentalsList.appendChild(rentalCard);
        });
    }
    
    createOwnerRentalCard(rental) {
        const card = document.createElement('div');
        card.className = 'rental-card owner-rental-card';
        
        // Форматируем даты
        const startDate = new Date(rental.startDate).toLocaleDateString('ru-RU');
        const endDate = new Date(rental.endDate).toLocaleDateString('ru-RU');
        const createdDate = new Date(rental.createdAt).toLocaleDateString('ru-RU');
        
        // Определяем статус на русском
        const statusLabels = {
            'pending': 'Ожидает подтверждения',
            'confirmed': 'Подтверждена',
            'active': 'Активна',
            'completed': 'Завершена',
            'cancelled': 'Отменена'
        };
        
        const statusLabel = statusLabels[rental.status] || rental.status;
        const statusClass = `status-${rental.status}`;
        
        // Рассчитываем количество дней и стоимость
        const diffTime = Math.abs(new Date(rental.endDate) - new Date(rental.startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalCost = diffDays * rental.car.pricePerDay + (rental.withDriver ? diffDays * 1000 : 0);
        
        card.innerHTML = `
            <div class="rental-header">
                <div class="rental-car-info">
                    <h3>${rental.car.brand} ${rental.car.model} (${rental.car.year})</h3>
                    <p class="rental-client">Арендатор: ${rental.tenant.firstName} ${rental.tenant.lastName}</p>
                    <p class="rental-created">Заявка от: ${createdDate}</p>
                </div>
                <span class="rental-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="rental-details">
                <div class="rental-period">
                    <p><strong>Период аренды:</strong> ${startDate} - ${endDate} (${diffDays} дн.)</p>
                </div>
                <div class="rental-locations">
                    <p><strong>Получение:</strong> ${rental.pickupLocation}</p>
                    <p><strong>Возврат:</strong> ${rental.returnLocation}</p>
                </div>
                <div class="rental-cost-info">
                    <p><strong>Стоимость:</strong> ${totalCost} ₽</p>
                    ${rental.withDriver ? '<p><strong>С водителем</strong> (+1000₽/день)</p>' : ''}
                </div>
                ${rental.notes ? `<p><strong>Примечания:</strong> ${rental.notes}</p>` : ''}
                <div class="rental-contact">
                    <p><strong>Контакт:</strong> ${rental.tenant.email}, ${rental.tenant.phone}</p>
                </div>
            </div>
            <div class="rental-actions">
                <button class="btn btn-sm btn-info" onclick="app.showRentalDetails('${rental.id}')">Подробнее</button>
                ${rental.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="app.approveRental('${rental.id}')">Подтвердить</button>
                    <button class="btn btn-sm btn-danger" onclick="app.rejectRental('${rental.id}')">Отклонить</button>
                ` : ''}
                ${rental.status === 'confirmed' ? `
                    <button class="btn btn-sm btn-warning" onclick="app.markRentalActive('${rental.id}')">Отметить как активную</button>
                ` : ''}
                ${rental.status === 'active' ? `
                    <button class="btn btn-sm btn-success" onclick="app.completeRental('${rental.id}')">Завершить аренду</button>
                ` : ''}
            </div>
        `;
        
        return card;
    }
    
    async approveRental(rentalId) {
        try {
            console.log("Approving rental:", rentalId);
            
            const response = await window.api.approveRental(rentalId);
            console.log("Rental approval response:", response);
            
            alert("Заявка на аренду подтверждена!");
            
            // Перезагружаем список заявок
            this.loadOwnerRentals();
            
        } catch (error) {
            console.error("Error approving rental:", error);
            alert(`Ошибка подтверждения заявки: ${error.message}`);
        }
    }
    
    async rejectRental(rentalId) {
        const reason = prompt("Укажите причину отклонения заявки (необязательно):");
        
        try {
            console.log("Rejecting rental:", rentalId, "with reason:", reason);
            
            const response = await window.api.rejectRental(rentalId, reason);
            console.log("Rental rejection response:", response);
            
            alert("Заявка на аренду отклонена");
            
            // Перезагружаем список заявок
            this.loadOwnerRentals();
            
        } catch (error) {
            console.error("Error rejecting rental:", error);
            alert(`Ошибка отклонения заявки: ${error.message}`);
        }
    }
    
    async markRentalActive(rentalId) {
        if (!confirm("Отметить аренду как активную? Это означает, что автомобиль передан арендатору.")) {
            return;
        }
        
        try {
            console.log("Marking rental as active:", rentalId);
            
            const response = await window.api.updateRentalStatus(rentalId, 'active');
            console.log("Rental status update response:", response);
            
            alert("Аренда отмечена как активная");
            
            // Перезагружаем список заявок
            this.loadOwnerRentals();
            
        } catch (error) {
            console.error("Error marking rental as active:", error);
            alert(`Ошибка обновления статуса: ${error.message}`);
        }
    }
    
    async completeRental(rentalId) {
        if (!confirm("Завершить аренду? Это означает, что автомобиль возвращен владельцу.")) {
            return;
        }
        
        try {
            console.log("Completing rental:", rentalId);
            
            const response = await window.api.updateRentalStatus(rentalId, 'completed');
            console.log("Rental completion response:", response);
            
            alert("Аренда завершена");
            
            // Перезагружаем список заявок
            this.loadOwnerRentals();
            
        } catch (error) {
            console.error("Error completing rental:", error);
            alert(`Ошибка завершения аренды: ${error.message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, начинаем инициализацию');
    
    // Инициализируем API
    window.api = new Api();
    console.log('API инициализирован:', !!window.api);
      // Инициализируем приложение
    window.app = new App();
    app = window.app;
    console.log('App инициализирован:', !!app);
    
    // Небольшая задержка перед инициализацией Auth
    setTimeout(() => {
    // Инициализируем авторизацию с небольшой задержкой
    setTimeout(() => {
        window.auth = new Auth();
        console.log('Auth инициализирован:', !!window.auth);
    }, 100);
        
        // Проверяем, что кнопки найдены
        const btnLogin = document.getElementById('btn-login');
        const btnRegister = document.getElementById('btn-register');
        console.log('Кнопки найдены:', { 
            login: !!btnLogin, 
            register: !!btnRegister 
        });
        
        if (btnLogin) {
            console.log('Кнопка "Войти" classList:', btnLogin.className);
            console.log('Кнопка "Войти" видима:', !btnLogin.classList.contains('hidden'));
        }
        if (btnRegister) {
            console.log('Кнопка "Регистрация" classList:', btnRegister.className);
            console.log('Кнопка "Регистрация" видима:', !btnRegister.classList.contains('hidden'));
        }
    }, 100);
    
    document.addEventListener('userLoggedIn', () => {
        console.log('User logged in event captured, updating UI');
        const ownerElements = document.querySelectorAll('.owner-only');
        if (window.auth && window.auth.user && window.auth.user.role === 'owner') {
            console.log('Showing owner elements:', ownerElements.length);
            ownerElements.forEach(el => {
                el.classList.remove('hidden');
            });
            
            // Переинициализируем элементы управления автомобилями после показа owner-only элементов
            setTimeout(() => {
                console.log('Reinitializing car management for owner');
                app.setupCarManagement();
            }, 200);
        }
    });
});

function initializeOwnerControls() {
        console.log("Initializing owner controls after login");
        
        // Проверяем, что пользователь - владелец
        if (!window.auth || !window.auth.user || window.auth.user.role !== 'owner') {
            console.log("User is not an owner, skipping owner controls initialization");
            return;
        }
        
        // Используем глобальный объект app
        if (window.app) {
            // Ищем элементы управления автомобилями
            window.app.findCarManagementElements();
            
            // Если кнопка найдена, привязываем обработчик
            if (window.app.addCarBtn) {
                console.log("Found add car button, setting up event listener");
                // Удаляем предыдущий обработчик, если есть
                if (window.app.addCarBtnHandler) {
                    window.app.addCarBtn.removeEventListener('click', window.app.addCarBtnHandler);
                }
                
                // Создаем и привязываем новый обработчик
                window.app.addCarBtnHandler = () => {
                    console.log("Add car button clicked!");
                    window.app.showAddCarForm();
                };
                
                window.app.addCarBtn.addEventListener('click', window.app.addCarBtnHandler);
                console.log("Add car button event listener attached successfully");
            } else {
                console.warn("Add car button still not found after login");
            }
            
            // Настраиваем остальные обработчики для управления автомобилями
            window.app.setupCarManagementEventListeners();
        }
    }
