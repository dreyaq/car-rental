// Debug: Auth.js loaded
console.log('auth.js файл загружен');

class Auth {
    constructor() {
        this.user = null;
        this.isLoading = false;
        // DOM elements will be initialized in initElements()
        this.init();
    }

    init() {
        console.log('Auth: Starting initialization');
        this.initElements();
        this.setupEventListeners();
        this.checkAuth();
    }

    initElements() {
        console.log('Auth: Initializing DOM elements');
        this.loginModal = document.getElementById('login-modal');
        this.registerModal = document.getElementById('register-modal');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.btnLogin = document.getElementById('btn-login');
        this.btnRegister = document.getElementById('btn-register');
        this.btnLogout = document.getElementById('btn-logout');
        this.showLoginLink = document.getElementById('show-login');
        this.showRegisterLink = document.getElementById('show-register');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.authRequiredElements = document.querySelectorAll('.auth-required');
        this.notLoggedInElements = document.querySelectorAll('.not-logged-in');
        this.loggedInElements = document.querySelectorAll('.logged-in');
        this.adminOnlyElements = document.querySelectorAll('.admin-only');
        this.ownerOnlyElements = document.querySelectorAll('.owner-only');
        
        console.log('Auth: DOM elements found:', {
            btnLogin: !!this.btnLogin,
            btnRegister: !!this.btnRegister,
            loginModal: !!this.loginModal,
            registerModal: !!this.registerModal,
            loginForm: !!this.loginForm,
            registerForm: !!this.registerForm
        });
    }    setupEventListeners() {
        console.log('Auth: Setting up event listeners');
        
        if (!this.btnLogin) {
            console.error('Auth: Login button not found!');
            // Попробуем найти снова
            this.btnLogin = document.getElementById('btn-login');
            console.log('Auth: Retry finding login button:', !!this.btnLogin);
        }
        if (!this.btnRegister) {
            console.error('Auth: Register button not found!');
            // Попробуем найти снова
            this.btnRegister = document.getElementById('btn-register');
            console.log('Auth: Retry finding register button:', !!this.btnRegister);
        }
        
        if (!this.btnLogin || !this.btnRegister) {
            console.error('Auth: Critical error - buttons not found, retrying in 500ms');
            setTimeout(() => {
                this.initElements();
                this.setupEventListeners();
            }, 500);
            return;
        }          this.btnLogin.addEventListener('click', (e) => {
            console.log('Auth: Login button clicked!');
            this.showModal(this.loginModal);
        });
        this.btnRegister.addEventListener('click', (e) => {
            console.log('Auth: Register button clicked!');
            this.showModal(this.registerModal);
        });
        if (this.showLoginLink) {
            this.showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal(this.registerModal);
                this.showModal(this.loginModal);
            });
        }
        
        if (this.showRegisterLink) {
            this.showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal(this.loginModal);
                this.showModal(this.registerModal);
            });
        }
        
        if (this.closeModalBtns) {
            this.closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.hideModal(this.loginModal);
                    this.hideModal(this.registerModal);
                });
            });
        }
        
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
          if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        if (this.btnLogout) {
            this.btnLogout.addEventListener('click', () => this.handleLogout());
        }
        
        console.log('Auth: Event listeners setup complete');
    }    async checkAuth() {
        console.log('checkAuth called, api available:', !!window.api);
        if (window.api && window.api.isAuthenticated()) {
            try {
                this.isLoading = true;
                this.user = await window.api.getProfile();
                this.updateUI();
            } catch (error) {
                console.error('Failed to get user profile:', error);
                window.api.clearToken();
                this.user = null;
                this.updateUI();
            } finally {
                this.isLoading = false;
            }
        } else {
            this.user = null;
            this.updateUI();
        }
    }    showModal(modal) {
        console.log('showModal called with:', modal);
        if (modal) {
            console.log('Modal classes before:', modal.className);
            modal.classList.remove('hidden');
            console.log('Modal classes after:', modal.className);
            console.log('Modal visible:', !modal.classList.contains('hidden'));
        } else {
            console.error('showModal: modal is null or undefined!');
        }
    }

    hideModal(modal) {
        modal.classList.add('hidden');
    }

    updateUI() {
        const isAuthenticated = !!this.user;
        const isAdmin = isAuthenticated && this.user.role === 'admin';
        const isOwner = isAuthenticated && this.user.role === 'owner';
        
        console.log("Auth status:", { isAuthenticated, isAdmin, isOwner, userRole: this.user?.role });
        
        this.authRequiredElements.forEach(el => {
            el.classList.toggle('hidden', !isAuthenticated);
        });
        
        this.notLoggedInElements.forEach(el => {
            el.classList.toggle('hidden', isAuthenticated);
        });
        
        this.loggedInElements.forEach(el => {
            el.classList.toggle('hidden', !isAuthenticated);
        });
        
        this.adminOnlyElements.forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });

        this.ownerOnlyElements = document.querySelectorAll('.owner-only');
        this.ownerOnlyElements.forEach(el => {
            console.log("Owner element:", el, "Hidden:", !isOwner);
            el.classList.toggle('hidden', !isOwner);
        });

        if (isAuthenticated && this.user) {
            const firstNameInput = document.getElementById('firstName');
            const lastNameInput = document.getElementById('lastName');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');
            
            if (firstNameInput) firstNameInput.value = this.user.firstName;
            if (lastNameInput) lastNameInput.value = this.user.lastName;
            if (emailInput) emailInput.value = this.user.email;
            if (phoneInput) phoneInput.value = this.user.phone;
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        try {
            this.isLoading = true;
            const response = await window.api.login({ email, password });
            console.log("Login response:", response);
            
            if (!response.user) {
                console.error("No user data in login response");
                alert("Ошибка входа: данные пользователя не получены");
                return;
            }
              this.user = response.user;
            console.log("User role:", this.user.role);
            
            this.hideModal(this.loginModal);
            this.updateUI();
            
            const loginEvent = new Event('userLoggedIn');
            document.dispatchEvent(loginEvent);
            
            alert('Вы успешно вошли в систему!');
            
            this.loginForm.reset();
            
            setTimeout(() => {
                if (this.user.role === 'owner') {
                    console.log("Navigating to my-cars for owner");
                    app.navigateTo('myCars');
                } else {
                    app.navigateTo('home');
                }
            }, 100);
        } catch (error) {
            alert(`Ошибка входа: ${error.message}`);
            console.error("Login error:", error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleRegister() {
        const firstName = document.getElementById('register-firstName').value;
        const lastName = document.getElementById('register-lastName').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirmPassword').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        try {
            this.isLoading = true;
            const userData = {
                firstName,
                lastName,
                email,
                phone,
                password,
                role
            };
            
            await window.api.register(userData);
            alert('Регистрация успешна! Пожалуйста, войдите в систему.');
            
            this.registerForm.reset();
            this.hideModal(this.registerModal);
            this.showModal(this.loginModal);
        } catch (error) {
            alert(`Ошибка регистрации: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }    handleLogout() {
        window.api.clearToken();
        this.user = null;
        this.updateUI();
        alert('Вы вышли из системы.');
        app.navigateTo('home');
    }
}

