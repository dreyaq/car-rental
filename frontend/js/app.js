let app = null;

class App {    
    constructor() {
        this.sections = {
            home: document.getElementById('home-section'),
            cars: document.getElementById('cars-section'),
            rentals: document.getElementById('rentals-section'),
            profile: document.getElementById('profile-section'),
            myCars: document.getElementById('my-cars-section'),
        };
        this.navLinks = {
            home: document.getElementById('nav-home'),
            cars: document.getElementById('nav-cars'),
            rentals: document.getElementById('nav-rentals'),
            profile: document.getElementById('nav-profile'),
            myCars: document.getElementById('nav-my-cars'),
        };
        this.featuredCarsGrid = document.getElementById('featured-cars-grid');
        this.allCarsGrid = document.getElementById('all-cars-grid');
        this.carDetailModal = document.getElementById('car-detail-modal');
        this.carDetailContent = document.getElementById('car-detail-content');
        this.rentalModal = document.getElementById('rental-modal');
        this.rentalCarInfo = document.getElementById('rental-car-info');
        this.rentalForm = document.getElementById('rental-form');
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
        });
    }
    
    refreshElements() {
        console.log("Refreshing page elements");
        this.sections = {
            home: document.getElementById('home-section'),
            cars: document.getElementById('cars-section'),
            rentals: document.getElementById('rentals-section'),
            profile: document.getElementById('profile-section'),
            myCars: document.getElementById('my-cars-section'),
        };
        
        this.navLinks = {
            home: document.getElementById('nav-home'),
            cars: document.getElementById('nav-cars'),
            rentals: document.getElementById('nav-rentals'),
            profile: document.getElementById('nav-profile'),
            myCars: document.getElementById('nav-my-cars'),
        };
        
        this.refreshCarManagementElements();
    }
    
    refreshCarManagementElements() {
        this.carFormModal = document.getElementById('car-form-modal');
        this.carForm = document.getElementById('car-form');
        this.addCarBtn = document.getElementById('add-car-btn');
        this.ownerCarsGrid = document.getElementById('owner-cars-grid');
        this.cancelCarFormBtn = document.getElementById('cancel-car-form');
    }

    setupNavigation() {
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
            }
            
            if (section === 'cars') {
                this.loadAllCars();
            } else if (section === 'rentals' && auth.user) {
                this.loadRentals();
            } else if (section === 'profile' && auth.user) {
                this.loadUserProfile();
            } else if (section === 'myCars' && auth.user && auth.user.role === 'owner') {
                this.loadOwnerCars();
            }
        }
    }

    setupCarManagement() {
        console.log("Setting up car management");
        this.carFormModal = document.getElementById('car-form-modal');
        this.carForm = document.getElementById('car-form');
        this.addCarBtn = document.getElementById('add-car-btn');
        this.ownerCarsGrid = document.getElementById('owner-cars-grid');
        this.cancelCarFormBtn = document.getElementById('cancel-car-form');

        if (!this.carFormModal) console.warn("car-form-modal element not found");
        if (!this.carForm) console.warn("car-form element not found");
        if (!this.addCarBtn) console.warn("add-car-btn element not found");
        if (!this.ownerCarsGrid) console.warn("owner-cars-grid element not found");
        if (!this.cancelCarFormBtn) console.warn("cancel-car-form element not found");
        
        if (!this.carFormModal || !this.carForm || !this.addCarBtn) {
            console.error("Missing required elements for car management");
            return;
        }

        this.addCarBtn.addEventListener('click', () => this.showAddCarForm());
        this.carForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCarFormSubmit();
        });
        this.cancelCarFormBtn.addEventListener('click', () => {
            this.carFormModal.classList.add('hidden');
            this.resetImagePreview();
        });
        this.carFormModal.querySelector('.close-modal').addEventListener('click', () => {
            this.carFormModal.classList.add('hidden');
            this.resetImagePreview();
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.carFormModal) {
                this.carFormModal.classList.add('hidden');
                this.resetImagePreview();
            }
        });

        const pricePerDayInput = document.getElementById('car-price-day');
        const pricePerWeekInput = document.getElementById('car-price-week');
        const pricePerMonthInput = document.getElementById('car-price-month');
        
        if (pricePerDayInput && pricePerWeekInput && pricePerMonthInput) {
            pricePerDayInput.addEventListener('input', () => {
                const dayPrice = parseFloat(pricePerDayInput.value) || 0;
                pricePerWeekInput.value = Math.round(dayPrice * 7 * 0.9);
                pricePerMonthInput.value = Math.round(dayPrice * 30 * 0.8); 
            });
        }
        
        const imageFileInput = document.getElementById('car-image-file');
        const imageUrlInput = document.getElementById('car-image-url');
        const imagePreview = document.getElementById('image-preview');
        
        if (imageFileInput) {
            imageFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (imageUrlInput) imageUrlInput.value = '';
                    
                    this.previewImage(file);
                }
            });
        }
        
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => {
                const url = e.target.value.trim();
                if (url) {
                    if (imageFileInput) imageFileInput.value = '';
                    
                    if (imagePreview) {
                        imagePreview.style.backgroundImage = `url('${url}')`;
                        imagePreview.classList.remove('hidden');
                    }
                } else {
                    this.resetImagePreview();
                }
            });
        }
    }
    
    previewImage(file) {
        const imagePreview = document.getElementById('image-preview');
        if (!imagePreview) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.style.backgroundImage = `url('${e.target.result}')`;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
    
    resetImagePreview() {
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.style.backgroundImage = '';
            imagePreview.classList.add('hidden');
        }
    }

    createOwnerCarCard(car) {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <div class="car-image" style="background-image:url('${car.images && car.images.length ? car.images[0].imagePath : 'img/no-car.png'}')"></div>
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
        document.getElementById('car-form-title').textContent = 'Добавить автомобиль';
        document.getElementById('car-id').value = '';
        this.carForm.reset();
        this.resetImagePreview();
        this.carFormModal.classList.remove('hidden');
    }
    
    async showEditCarForm(carId) {
        try {
            document.getElementById('car-form-title').textContent = 'Редактировать автомобиль';
            console.log("Загрузка данных автомобиля для редактирования, ID:", carId);
            const response = await api.getOwnerCarById(carId);
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
                document.getElementById('car-features').value = featureNames;
            } else {
                document.getElementById('car-features').value = '';
            }

            if (car.images && car.images.length) {
                const imageUrl = car.images[0].imagePath;
                document.getElementById('car-image-url').value = imageUrl;
                
                const imagePreview = document.getElementById('image-preview');
                if (imagePreview) {
                    imagePreview.style.backgroundImage = `url('${imageUrl}')`;
                    imagePreview.classList.remove('hidden');
                }
            } else {
                document.getElementById('car-image-url').value = '';
                this.resetImagePreview();
            }
            
            this.carFormModal.classList.remove('hidden');
        } catch (e) {
            alert('Не удалось загрузить данные автомобиля');
            console.error('Error loading car for edit:', e);
        }
    }

    async handleCarFormSubmit() {
        try {
            const carId = document.getElementById('car-id').value;
            const isNewCar = !carId;
            const brand = document.getElementById('car-brand').value;
            const carData = {
                brand: brand,
                make: brand, 
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
            const weekPrice = document.getElementById('car-price-week').value;
            if (weekPrice && weekPrice.trim() !== '') {
                carData.pricePerWeek = parseFloat(weekPrice);
            }
            
            const monthPrice = document.getElementById('car-price-month').value;
            if (monthPrice && monthPrice.trim() !== '') {
                carData.pricePerMonth = parseFloat(monthPrice);
            }
            const featuresInput = document.getElementById('car-features').value;
            if (featuresInput) {
                const featureNames = featuresInput.split(',').map(f => f.trim()).filter(f => f);
                
                try {
                    console.log("Fetching feature IDs for:", featureNames);
                    const featureIds = await api.getFeatureIdsByNames(featureNames);
                    console.log("Retrieved feature IDs:", featureIds);
                    if (featureIds && featureIds.length > 0) {
                        carData.features = featureIds;
                    }
                } catch (err) {
                    console.warn("Could not get feature IDs, proceeding without features:", err);
                }
            }
            
            const imageUrlInput = document.getElementById('car-image-url');
            const imageFileInput = document.getElementById('car-image-file');
            
            if (imageUrlInput && imageUrlInput.value) {
                carData.images = [{
                    imagePath: imageUrlInput.value,
                    isMain: true
                }];
            } 
            else if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
                const file = imageFileInput.files[0];
                const reader = new FileReader();
                
                await new Promise((resolve, reject) => {
                    reader.onload = e => {
                        carData.images = [{
                            imagePath: e.target.result,
                            isMain: true
                        }];
                        resolve();
                    };
                    reader.onerror = () => {
                        console.error('Error reading file');
                        reject(new Error('Failed to read the image file'));
                    };
                    reader.readAsDataURL(file);
                });
            }
            
            let response;
            
            if (isNewCar) {
                console.log("Sending car data to API:", JSON.stringify(carData, null, 2));
                response = await api.createCar(carData);
                console.log("Car creation response:", response);
                alert('Автомобиль успешно добавлен!');
            } else {
                console.log("Sending car update data to API:", JSON.stringify(carData, null, 2));
                response = await api.updateCar(carId, carData);
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
            await api.deleteCar(carId);
            alert('Автомобиль удален');
            this.loadOwnerCars();
        } catch (e) {
            alert(`Ошибка: ${e.message || 'Не удалось удалить автомобиль'}`);
            console.error('Error deleting car:', e);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.auth = new Auth();
    
    document.addEventListener('userLoggedIn', () => {
        console.log('User logged in event captured, updating UI');
        const ownerElements = document.querySelectorAll('.owner-only');
        if (auth && auth.user && auth.user.role === 'owner') {
            console.log('Showing owner elements:', ownerElements.length);
            ownerElements.forEach(el => {
                el.classList.remove('hidden');
            });
        }
    });
});
