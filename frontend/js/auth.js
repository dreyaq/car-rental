class Auth {    constructor() {
        this.user = null;
        this.isLoading = false;
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
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        this.btnLogin.addEventListener('click', () => this.showModal(this.loginModal));
        this.btnRegister.addEventListener('click', () => this.showModal(this.registerModal));
        this.showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal(this.registerModal);
            this.showModal(this.loginModal);
        });
        this.showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal(this.loginModal);
            this.showModal(this.registerModal);
        });
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal(this.loginModal);
                this.hideModal(this.registerModal);
            });
        });
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        this.btnLogout.addEventListener('click', () => this.handleLogout());
    }

    async checkAuth() {
        if (api.isAuthenticated()) {
            try {
                this.isLoading = true;
                this.user = await api.getProfile();
                this.updateUI();
            } catch (error) {
                console.error('Failed to get user profile:', error);
                api.clearToken();
                this.user = null;
                this.updateUI();
            } finally {
                this.isLoading = false;
            }
        } else {
            this.user = null;
            this.updateUI();
        }
    }

    showModal(modal) {
        modal.classList.remove('hidden');
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
            const response = await api.login({ email, password });
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
            
            await api.register(userData);
            alert('Регистрация успешна! Пожалуйста, войдите в систему.');
            
            this.registerForm.reset();
            this.hideModal(this.registerModal);
            this.showModal(this.loginModal);
        } catch (error) {
            alert(`Ошибка регистрации: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    handleLogout() {
        api.clearToken();
        this.user = null;
        this.updateUI();
        alert('Вы вышли из системы.');
        app.navigateTo('home');
    }
}

