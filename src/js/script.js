let ALL_OWNERS = [];
let ALL_EXCELS = [];

const SERVER_URL = 'https://api.parus-smart.site/';

const SWIPER_WRAPPER_EL = document.querySelector('#swiper-wrapper');
const HEADER_BUTTON_EL = document.querySelector('#header__btn');
const NAV_EL = document.querySelector('#nav');
const NAV_LIST_EL = document.querySelector('#navList');
const EXCEL_INFO_EL = document.querySelector('#counter__type');
const PRELOADER_EL = document.querySelector('#preloader');

function createOwners(data) {
    const res = data.map((owner) => ({
        id: `id_${owner.excelRowNumber}`,
        flatId: owner.flatId,
        fullName: owner.ownerFullName,
        flatSpace: owner.flatSpace,
        personalNumber: owner.personalNumber,
        counterNumber: owner.counterNumber,
        previousValue: owner.previousValue,
        currentValue: owner.currentValue || '',
        excelRowNumber: owner.excelRowNumber,
        counterType: owner.counterType,
        tariffType: owner.tariffType,
        houseName: owner.houseName,
    }));
    return res;
}
function createExcels(data) {
    const res = data.data.map((excel) => ({
        id: `${excel.id}`,
        name: excel.name,
        counterType: excel.counterType,
        tariffType: excel.tariffType,
        houseName: excel.houseName,
    }));
    return res;
}

const FETCH_RETRY_COUNT = 5;
function fetchOwners({ flatId }) {
    let limit = 0;
    const url = `${SERVER_URL}api/private/gtable/${flatId}?month=october&tabName=%D0%90%D1%80%D0%BA%D1%83%D1%881`;
    async function run(resolve, reject) {
        try {
            const res = await fetch(url);
            const json = await res.json();
            resolve({ data: json });
        } catch (error) {
            setTimeout(() => {
                run(resolve, reject);
            }, 100);
        }
    }
    return new Promise((resolve, reject) => {
        limit += 1;
        if (limit >= FETCH_RETRY_COUNT) {
            resolve({ error: 'Too many errors' });
        } else {
            run(resolve, reject);
        }
    });
}

function fetchCounters() {
    let limit = 0;
    const url = `${SERVER_URL}api/private/gtable_config`;
    async function run(resolve, reject) {
        try {
            const res = await fetch(url);
            const json = await res.json();
            resolve({ data: json });
        } catch (error) {
            setTimeout(() => {
                run(resolve, reject);
            }, 100);
        }
    }
    return new Promise((resolve, reject) => {
        limit += 1;
        if (limit >= FETCH_RETRY_COUNT) {
            resolve({ error: 'Too many errors' });
        } else {
            run(resolve, reject);
        }
    });
}

async function initOwnersAsync({ flatId }) {
    const { data, error } = await fetchOwners({ flatId });
    if (data) {
        const owners = createOwners(data);
        ALL_OWNERS = owners;
    } else {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}
async function initCountersAsync() {
    const { data, error } = await fetchCounters();
    if (data) {
        const counters = createExcels(data);
        ALL_EXCELS = counters;
    } else {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

function getOwnerItemHtml({ id, flatId, counterNumber, previousValue, currentValue }) {
    let differenceCounter;
    if (currentValue) {
        differenceCounter = Math.floor(currentValue - previousValue);
    } else {
        differenceCounter = '-';
    }
    const ownersItemHtml = `
            <div class="swiper-slide">
                <div class='owner__content ${currentValue ? 'correct' : ''}'>
                    <div class='owner__id'>Квартира №: ${flatId}</div>
                    <article id='owner__counter' class='owner__counter'>
                        
                        <label for='counter' class='counter__label'>#${counterNumber}</label>
                        </br>
                        <input onkeyup="onInputChange(this)"  dataid="${flatId}" tabIndex='-1' type="number" name="counter" id="owner__${id}"  class='owner__input' value="${currentValue}" placeholder='${previousValue}' autofocus>
                        </br>
                        <button dataid="${flatId}" type='button' class='input__button' style='display:none;' onclick='onButtonClick(this)'  >OK</button>
                    </article>
 
                    <div class='owner__differenceValue' id='owner__differenceValue'> Різниця: ${differenceCounter} </div>
                </div>
            </div>
        `;
    // <div class='owner__counterNumber'>Номер лічильника: ${counterNumber}</div>
    // <div class='owner__previousValue'> Попередній показ лічильника: ${previousValue} </div>
    return ownersItemHtml;
}
function onInputChange(el) {
    const prev = parseFloat(el.getAttribute('placeholder'), 10) || 0;
    const diffEl = el.closest('.owner__content').querySelector('.owner__differenceValue');
    diffEl.innerHTML = `Різниця: ${Math.floor(parseFloat(el.value, 10) - prev)}`;
}
function getCountersListHtml({ id, name }) {
    const ownersItemHtml = `
            <li class="nav__item">
                <a dataid="${id}" href="#" class="nav__link" id="nav__link${id}">
                    <span class="nav__text">${name}</span> 
                </a>
            </li>
        `;
    return ownersItemHtml;
}
function getExcelInfoHtml(activeCounter) {
    const ownersItemHtml = `
            <span class='counter__type-text'>${activeCounter.name}</span>
        `;
    return ownersItemHtml;
}
function renderOwners({ owners }) {
    const ownersHtml = owners.map((owner) => getOwnerItemHtml(owner));
    SWIPER_WRAPPER_EL.innerHTML = ownersHtml.join(' ');
}
function renderCountersList({ counters }) {
    const countersHtml = counters.map((counter) => getCountersListHtml(counter));
    NAV_LIST_EL.innerHTML = countersHtml.join(' ');
}

function onButtonClick(target) {
    const flatId = target.getAttribute('dataid');
    const ownerContentEl = target.closest('.owner__content');
    const currentOwner = ALL_OWNERS.find((own) => own.flatId === flatId);
    const currentInputEl = ownerContentEl.querySelector(`#owner__${currentOwner.id}`);
    // eslint-disable-next-line no-undef
    axios
        .post(`${SERVER_URL}api/private/gtable/${localStorage.getItem('ACTIVE_EXCEL_ID')}/set_value`, {
            month: 'october',
            personalNumber: `${currentOwner.personalNumber}`,
            value: currentInputEl.value,
            tabName: 'Аркуш1',
        })
        .then(() => {
            currentOwner.currentValue = +currentInputEl.value;
            if (currentInputEl.value) {
                ownerContentEl.classList.remove('error');
                ownerContentEl.classList.add('correct');
            } else {
                ownerContentEl.classList.remove('error');
                ownerContentEl.classList.remove('correct');
            }
            const ownerDifferenceValue = document.querySelector('#owner__differenceValue');
            ownerDifferenceValue.innerText = `Різниця показів лічильника: ${
                currentOwner.currentValue - currentOwner.previousValue
            }`;

            setTimeout(() => {
                // eslint-disable-next-line no-use-before-define
                SWIPER.slideNext(600);
            }, [200]);
        })
        .catch((error) => {
            ownerContentEl.classList.add('error');
            // eslint-disable-next-line no-console
            console.log(error);
        });
}

let SWIPER;
async function startAsync() {
    await initCountersAsync();
    renderCountersList({ counters: ALL_EXCELS });
    const activeExcelId = localStorage.getItem('ACTIVE_EXCEL_ID');
    if (activeExcelId) {
        // eslint-disable-next-line no-use-before-define
        await loadAndRenderOwnersAndCreateSwiperAsync({ excelId: activeExcelId });
    } else {
        NAV_EL.classList.add('visible');
        PRELOADER_EL.classList.add('preloader-remove');
    }

    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            onButtonClick(e.target, e, e.target.id);
        }
    });
}
startAsync();

const FLAT_NUMBER_INPUT = document.querySelector('#flat__number');

function onFlatNumberInputClick({ target }) {
    const counterValue = target.value;
    SWIPER.slideTo(counterValue - 1, 800);
}

function onHeaderButtonClick({ target }) {
    const headerLink = target.closest('#header__btn');
    headerLink.classList.toggle('open');
    if (headerLink.classList.contains('open')) {
        NAV_EL.classList.add('visible');
    } else {
        NAV_EL.classList.remove('visible');
    }
}

async function handleNavLinkClick({ target }) {
    const activeNavLinkEl = target.closest('.nav__link');
    if (activeNavLinkEl) {
        NAV_EL.classList.remove('visible');
        HEADER_BUTTON_EL.classList.remove('open');
        // PRELOADER_EL.classList.remove('preloader-hide');
        // PRELOADER_EL.classList.remove('preloader-remove')
        // PRELOADER_EL.classList.add('preloader-show');
        // PRELOADER_EL.classList.add('preloader-hide');
        // setTimeout(() => { PRELOADER_EL.classList.add('preloader-remove') }, 1000)

        const prevExcelId = localStorage.getItem('ACTIVE_EXCEL_ID');
        const prevLinkEl = document.getElementById(`nav__link${prevExcelId}`);
        if (prevLinkEl) {
            prevLinkEl.parentNode.classList.remove('active');
        }

        const excelId = activeNavLinkEl.getAttribute('dataid');
        localStorage.setItem('ACTIVE_EXCEL_ID', excelId);

        // eslint-disable-next-line no-use-before-define
        await loadAndRenderOwnersAndCreateSwiperAsync({ excelId: excelId });
    }
}

async function loadAndRenderOwnersAndCreateSwiperAsync({ excelId }) {
    PRELOADER_EL.classList.remove('preloader-remove');
    console.log('render');
    console.log('initial state', Number(localStorage.getItem('CURRENT_SLIDE')));
    const activeNavEl = document.getElementById(`nav__link${excelId}`);
    activeNavEl.parentNode.classList.add('active');

    const activeExcel = ALL_EXCELS.find((excel) => excel.id === excelId);
    const excelInfoHtml = getExcelInfoHtml(activeExcel);
    EXCEL_INFO_EL.innerHTML = excelInfoHtml;

    await initOwnersAsync({ flatId: excelId });
    renderOwners({ owners: ALL_OWNERS });

    if (SWIPER) {
        // eslint-disable-next-line no-console
        console.log('destroy');
        SWIPER.detachEvents();
        SWIPER.destroy(true, true);
        localStorage.removeItem('CURRENT_SLIDE');
    }
    // eslint-disable-next-line no-undef
    SWIPER = new Swiper('.swiper', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
        },
        keyboard: {
            enabled: true,
        },
        initialSlide: localStorage.getItem('CURRENT_SLIDE') ? Number(localStorage.getItem('CURRENT_SLIDE')) : 0,
        on: {
            slideChangeTransitionEnd(e) {
                if (ALL_EXCELS.length && ALL_OWNERS.length) {
                    localStorage.setItem('CURRENT_SLIDE', e.activeIndex.toString());
                }
                const activeSwipe = document.querySelector('.swiper-slide-active');
                activeSwipe.querySelector('.owner__input').focus();
            },
        },
    });
    PRELOADER_EL.classList.add('preloader-remove');
}

FLAT_NUMBER_INPUT.addEventListener('input', onFlatNumberInputClick);
HEADER_BUTTON_EL.addEventListener('click', onHeaderButtonClick);
NAV_LIST_EL.addEventListener('click', handleNavLinkClick);
