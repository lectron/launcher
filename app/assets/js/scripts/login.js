/**
 * Script for login.ejs
 */
// Validation Regexes.
const validUsername = /^[a-zA-Z0-9_]{1,16}$/
const basicEmail = /^\S+@\S+\.\S+$/
    //const validEmail          = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

// Login Elements
const loginCancelContainer = document.getElementById('loginCancelContainer')
const loginCancelButton = document.getElementById('loginCancelButton')
const loginEmailError = document.getElementById('loginEmailError')
const loginUsername = document.getElementById('loginUsername')
const loginPasswordError = document.getElementById('loginPasswordError')
const loginPassword = document.getElementById('loginPassword')
const checkmarkContainer = document.getElementById('checkmarkContainer')
const lockSVG = document.getElementById('lockSVG')
const profileSVG = document.getElementById('profileSVG')
const loginRememberOption = document.getElementById('loginRememberOption')
const loginPremiumOption = document.getElementById('loginPremiumOption')
const loginButton = document.getElementById('loginButton')
const loginForm = document.getElementById('loginForm')
const forgotpassword = document.getElementById('forgotpassword')
const loginDisclaimer = document.getElementById('loginDisclaimer')
const loginRememberText = document.getElementById('loginRememberText')
const loginContent = document.getElementById('loginContent')





const request = require('request-promise');


// Control variables.
let lu = false,
    lp = false

const loggerLogin = LoggerUtil('%c[Login]', 'color: #000668; font-weight: bold')


/**
 * Show a login error.
 * 
 * @param {HTMLElement} element The element on which to display the error.
 * @param {string} value The error text.
 */
function showError(element, value) {
    element.innerHTML = value
    element.style.opacity = 1
}

/**
 * Shake a login error to add emphasis.
 * 
 * @param {HTMLElement} element The element to shake.
 */
function shakeError(element) {
    if (element.style.opacity == 1) {
        element.classList.remove('shake')
        void element.offsetWidth
        element.classList.add('shake')
    }
}

/**
 * Validate that an email field is neither empty nor invalid.
 * 
 * @param {string} value The email value.
 */
function validateEmail(value) {
    if (value) {
        if (!basicEmail.test(value) && !validUsername.test(value)) {
            showError(loginEmailError, Lang.queryJS('login.error.invalidValue'))
            loginDisabled(true)
            lu = false
        } else {
            loginEmailError.style.opacity = 0
            lu = true
            if (lp) {
                loginDisabled(false)
            }
        }
    } else {
        lu = false
        showError(loginEmailError, Lang.queryJS('login.error.requiredValue'))
        loginDisabled(true)
    }
}

/**
 * Validate that the password field is not empty.
 * 
 * @param {string} value The password value.
 */
function validatePassword(value) {
    if (value) {
        loginPasswordError.style.opacity = 0
        lp = true
        if (lu) {
            loginDisabled(false)
        }
    } else {
        lp = false
        showError(loginPasswordError, Lang.queryJS('login.error.invalidValue'))
        loginDisabled(true)
    }
}

lockSVG.style.display = "none"
forgotpassword.style.display = "none"
loginDisclaimer.style.display = "none"
loginRememberText.style.marginLeft = 150


// Emphasize errors with shake when focus is lost.
loginUsername.addEventListener('focusout', (e) => {
    validateEmail(e.target.value)
    shakeError(loginEmailError)
})
loginPassword.addEventListener('focusout', (e) => {
    if (loginPremiumOption.checked) {
        validatePassword(e.target.value)
        shakeError(loginPasswordError)
    }
})

// Validate input for each field.
loginUsername.addEventListener('input', (e) => {
    validateEmail(e.target.value)
    loginDisabled(false)
})
loginPassword.addEventListener('input', (e) => {
    if (loginPremiumOption.checked) {
        validatePassword(e.target.value)
    }
})

loginPremiumOption.addEventListener('change', (e) => {
    loginPassword.hidden = !e.target.checked
    if (!e.target.checked) {
        lockSVG.style.display = "none"
        forgotpassword.style.display = "none"
        loginDisclaimer.style.display = "none"
        loginRememberText.style.marginRight = 10
        loginContent.style.height = '80%'
        loginContent.style.width = '30%'
        loginContent.style.transition = 'all 0.1s';

    } else {
        loginContent.style.transition = 'all 0.1s';
        lockSVG.style.display = null
        lockSVG.style.animationName = "shake"
        lockSVG.style.animationDuration = '1s'
        forgotpassword.style.display = null
        forgotpassword.style.animationName = "shake"
        forgotpassword.style.animationDuration = '1s'
        loginDisclaimer.style.display = null
        loginDisclaimer.style.animationName = "shake"
        loginDisclaimer.style.animationDuration = '1s'
        loginRememberText.style.marginLeft = 150
        loginContent.style.width = '35%'
        loginPassword.style.animationName = "shake"
        loginPassword.style.animationDuration = '1s'
        loginContent.style.height = '95%'
        loginContent.style.borderRadius = '2%'

    }
})

/**
 * Enable or disable the login button.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function loginDisabled(v) {
    if (loginButton.disabled !== v) {
        loginButton.disabled = v
    }
}

/**
 * Enable or disable loading elements.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function loginLoading(v) {
    if (v) {
        loginButton.setAttribute('loading', v)
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'))
    } else {
        loginButton.removeAttribute('loading')
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'))
    }
}

/**
 * Enable or disable login form.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function formDisabled(v) {
    loginDisabled(v)
    loginCancelButton.disabled = v
    loginUsername.disabled = v
    loginPassword.disabled = v
    if (v) {
        loginPremiumOption.setAttribute('disabled', v)
    } else {
        loginPremiumOption.removeAttribute('disabled')
    }
    loginPremiumOption.disabled = v
}

/**
 * Parses an error and returns a user-friendly title and description
 * for our error overlay.
 * 
 * @param {Error | {cause: string, error: string, errorMessage: string}} err A Node.js
 * error or Mojang error response.
 */
function resolveError(err) {
    // Mojang Response => err.cause | err.error | err.errorMessage
    // Node error => err.code | err.message
    if (err.cause != null && err.cause === 'UserMigratedException') {
        return {
            title: Lang.queryJS('login.error.userMigrated.title'),
            desc: Lang.queryJS('login.error.userMigrated.desc')
        }
    } else {
        if (err.error != null) {
            if (err.error === 'ForbiddenOperationException') {
                if (err.errorMessage != null) {
                    if (err.errorMessage === 'Invalid credentials. Invalid username or password.') {
                        return {
                            title: Lang.queryJS('login.error.invalidCredentials.title'),
                            desc: Lang.queryJS('login.error.invalidCredentials.desc')
                        }
                    } else if (err.errorMessage === 'Invalid credentials.') {
                        return {
                            title: Lang.queryJS('login.error.rateLimit.title'),
                            desc: Lang.queryJS('login.error.rateLimit.desc')
                        }
                    }
                }
            }
        } else {
            // Request errors (from Node).
            if (err.code != null) {
                if (err.code === 'ENOENT') {
                    // No Internet.
                    return {
                        title: Lang.queryJS('login.error.noInternet.title'),
                        desc: Lang.queryJS('login.error.noInternet.desc')
                    }
                } else if (err.code === 'ENOTFOUND') {
                    // Could not reach server.
                    return {
                        title: Lang.queryJS('login.error.authDown.title'),
                        desc: Lang.queryJS('login.error.authDown.desc')
                    }
                }
            }
        }
    }
    if (err.message != null) {
        if (err.message === 'NotPaidAccount') {
            return {
                title: Lang.queryJS('login.error.notPaid.title'),
                desc: Lang.queryJS('login.error.notPaid.desc')
            }
        } else {
            // Unknown error with request.
            return {
                title: Lang.queryJS('login.error.unknown.title'),
                desc: err.message
            }
        }
    } else {
        // Unknown Mojang error.
        return {
            title: err.error,
            desc: err.errorMessage
        }
    }
}

let loginViewOnSuccess = VIEWS.landing
let loginViewOnCancel = VIEWS.settings
let loginViewCancelHandler

function loginCancelEnabled(val) {
    if (val) {
        $(loginCancelContainer).show()
    } else {
        $(loginCancelContainer).hide()
    }
}

loginCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
        loginUsername.value = ''
        loginPassword.value = ''
        loginCancelEnabled(false)
        if (loginViewCancelHandler != null) {
            loginViewCancelHandler()
            loginViewCancelHandler = null
        }
    })
}

// Disable default form behavior.
loginForm.onsubmit = () => { return false }

// Bind login button behavior.
loginButton.addEventListener('click', () => {
    // Disable form.
    formDisabled(true)

    // Show loading stuff.
    loginLoading(true)

    var MojangAPI = require('mojang-api');
    MojangAPI.uuidAt(loginUsername.value, function(err, res) {
        if (err) {
            AuthManager.addAccount(loginUsername.value, loginPassword.value).then((value) => {
                updateSelectedAccount(value)
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'))
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                setTimeout(() => {
                    switchView(VIEWS.login, loginViewOnSuccess, 500, 500, () => {
                        // Temporary workaround
                        if (loginViewOnSuccess === VIEWS.settings) {
                            prepareSettings()
                        }
                        loginViewOnSuccess = VIEWS.landing // Reset this for good measure.
                        loginCancelEnabled(false) // Reset this for good measure.
                        loginViewCancelHandler = null // Reset this for good measure.
                        loginUsername.value = ''
                        loginPassword.value = ''
                        $('.circle-loader').toggleClass('load-complete')
                        $('.checkmark').toggle()
                        loginLoading(false)
                        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'))
                        formDisabled(false)
                    })
                }, 1000)
            }).catch((err) => {
                loginLoading(false)
                const errF = resolveError(err)
                setOverlayContent(errF.title, errF.desc, Lang.queryJS('login.tryAgain'))
                setOverlayHandler(() => {
                    formDisabled(false)
                    toggleOverlay(false)
                })
                toggleOverlay(true)
                loggerLogin.log('Error while logging in.', err)
            })
            if (loginPremiumOption.checked)
                console.log("false")

        } else {
            if (!loginPremiumOption.checked) {
                loginLoading(false)
                setOverlayContent('Username Already Exists', 'This username is already registered by another user, please choose another username', Lang.queryJS('login.tryAgain'))
                setOverlayHandler(() => {
                    formDisabled(false)
                    toggleOverlay(false)
                })
                toggleOverlay(true)

                loggerLogin.log('Error while logging in.', err)
                return;
            }
        }
    });




})