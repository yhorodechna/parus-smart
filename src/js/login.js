const LOGIN_BTN_EL = document.querySelector('#login__btn');
const LOGIN_EL = document.querySelector('#login');

function onLoginBtnClick({ target }) {
    const loginLink = target.closest('#login__btn');
    LOGIN_EL.classList.add('open');
}

function getLoginItemsHtml() {
    const loginItemsHtml = `
            <h2 class='login__title'>Login</h2>
            <article class='login__email' id='login__email'>
                <label for='login__email-text' class='login__email-text'>Email</label>
                </br>
                <input tabIndex='-1' name="login__email-text" id="login__email-input"  class='login__email-input' value="" autofocus>
                </br>
            </article>
            
            <article class='login__pass' id='login__pass'>
                <label for='login__pass-text' class='login__pass-text'>Password</label>
                </br>
                <input tabIndex='-1' name="login__pass-text" id="login__pass-input"  class='login__pass-input' value="">
                </br>
            </article>
            
            <button class='login__submit' id='login__submit'>Ok</button>
        `;
    return loginItemsHtml;
}

function renderLoginItems() {
    const loginItemsHtml = getLoginItemsHtml();
    LOGIN_EL.innerHTML = loginItemsHtml;
}
// renderLoginItems();

// LOGIN_BTN_EL.addEventListener('click', onLoginBtnClick);
