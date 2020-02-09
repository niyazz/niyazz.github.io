(function() {
    const key = 'wV03DvcfZ8MpwLsJgBl5l3cIKKacV2GR',
          limit = 16,
          list = document.querySelector(".list"),
          main = document.querySelector(".main"),
          buttons = document.querySelectorAll(".btn"),
          search = document.querySelector("input.search"),
          nav = document.querySelector(".header"),
          navTop = nav.offsetTop,
          texts = document.querySelectorAll(".text"),
          html = document.documentElement,
          load = debounce(loadGifs, 1500),
          load_phrases = ['more', 'also', 'load', 'extra'],
          copy_phrases = ['copied', 'done', 'replica', 'okay'],
          panel = document.querySelector('#panel'),
          sides = panel.querySelectorAll('.curtain'),
          planer = document.querySelector('.planer');

    let lastEndpoint = 'trending',
        lastInput = '',
        offset = 0,
        liked = JSON.parse(localStorage.getItem('liked')) || [],
        canLoad = true;

    document.documentElement.style.width = document.body.style.width =  `${Math.max(document.documentElement.clientWidth, window.innerWidth || 0)}px`;
    document.documentElement.style.height = document.body.style.height =  `${Math.max(document.documentElement.clientHeight, window.innerHeight || 0)}px`;

    function createRequest(method, url, data) {
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: data ? {'Content-Type': 'application/json'} : {}
        })
            .then(response => {
                if (response.status === 200)
                    return response.json();
                else
                    return response.json().then(err => {
                        const error = new Error("Wrong access!");
                        error.data = err;
                        throw error;
                    })
            });
    }

    function checkOnChanges(endpoint, input) {
        if (lastEndpoint !== endpoint ||
            lastInput !== input) {
            list.innerHTML = "";
            offset = 0;
            lastEndpoint = endpoint;
            lastInput = input;
        }
    }

    function loadGifs(api_key, endpoint, off, rating, lang) {
        canLoad = true;
        checkOnChanges(endpoint, search.value);
        const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${api_key}&limit=${limit}&offset=${off}&rating=${rating}&lang=${lang}${endpoint === 'trending' ? '' : `&q=${search.value}`}`;
        createRequest("GET", url)
            .then(res => {
                sides[0].style.width = '50%';
                sides[1].style.display = 'flex';
                showImages(res.data, list);
                animateText(load_phrases[randomInteger(0, copy_phrases.length)]);
                const allItems = Array.from(document.querySelectorAll('li'));
                const addedItems = allItems.slice(allItems.length - limit);
                addedItems.forEach(item => item.addEventListener('mouseenter', (e) => animateCloseCurtain(e)));
                offset += res.data.length + 1;
            })
            .catch(err => {
                console.log(err, err.data)
            })
    }

    function checkOnEnd() {
        if (!canLoad) return;
        const endOfPage = window.innerHeight + this.scrollY > main.offsetHeight;
        if (endOfPage) {
            load(key, lastEndpoint, offset, 'G', 'en');
        }
    }

    function showImages(images, list) {
        return list.insertAdjacentHTML('beforeend', images.map(img => {
            return `<li style = "background-color: rgba(${randBackground(10, 170)});">
				<img src = "${img.images.preview_gif.url}" data-url = ${img.images.downsized_large.url} alt = ${img.slug} /> </li>`
        }).join(''));
    }

    function animateText(action) {
        html.style.setProperty(`--from`, `${window.scrollY + html.clientHeight - texts[0].offsetHeight}px`);
        html.style.setProperty(`--to`, `${window.scrollY}px`);
        texts.forEach(text => text.addEventListener("animationend", (event) => {
            if (event.animationName === 'liftanim') {
                if (text.classList.contains('text-active')) {
                    text.classList.remove("text-active");
                }

            }
        }));
        texts.forEach(text => {
            text.textContent = action;
            if (!text.classList.contains('text-active')) {
                text.classList.add('text-active')
            }

        });
    }

    function animateCloseCurtain(e) {
        const coords = {
            width: e.target.getBoundingClientRect().width,
            height: e.target.getBoundingClientRect().height,
            x: e.target.getBoundingClientRect().left,
            y: e.target.getBoundingClientRect().top
        };
        panel.setAttribute('data-url', e.target.firstElementChild.dataset.url);
        panel.style.left = `${coords.x + window.scrollX}px`;
        panel.style.top = `${coords.y + window.scrollY}px`;
        panel.style.width = `${coords.width}px`;
        panel.style.height = `${coords.height}px`;
        panel.style.display = 'flex';
    }

    function animateFixNav() {
        if (window.scrollY >= navTop) {
            main.style.paddingTop = nav.offsetHeight + 'px';
            document.body.classList.add('fixed-nav');
            planer.classList.remove('planer-active-up', 'planer-active-down', 'planer-active-down-up')
        } else {
            main.style.paddingTop = '0';
            document.body.classList.remove('fixed-nav')
        }
    }

    function copyClipBoard(url) {
        animateText(copy_phrases[randomInteger(0, copy_phrases.length)]);
        navigator.clipboard.writeText(url);
    }

    function like(url) {
        animateText('like');
        liked.push(url.toString());
        localStorage.setItem('liked', JSON.stringify(liked));
    }

    function showLiked() {
        canLoad = false;
        lastEndpoint = 'liked';
        list.innerHTML = '';
        return list.insertAdjacentHTML('beforeend', liked.map(img => {
            return `<li style = "background-color: rgba(${randBackground(10, 170)})">
						<img src = "${img} alt = "liked" />
					</li>`
        }).join(''));
    }

    function openLiked(){
        sides[0].style.width = '100%';
        sides[1].style.display = 'none';
        showLiked();
        const allItems = document.querySelectorAll('li');
        allItems.forEach(item => item.addEventListener('mouseenter', (e) => animateCloseCurtain(e)));
    }

    function randBackground(min, max) {
        return `${randomInteger(min, max)}, ${randomInteger(min, max)},
		 ${randomInteger(min, max)}, ${randomInteger(min, max)}`;
    }

    function randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    function debounce(f, ms) {
        let isCooldown = false;
        return function () {
            if (isCooldown) return;
            f.apply(this, arguments);
            isCooldown = true;
            setTimeout(() => isCooldown = false, ms);
        }
    }

    function showInfo() {
        if (!this.classList.contains('planer-active-down')) {
            setTimeout(() => this.classList.add('planer-active-down'), 250);
            this.classList.add('planer-active-up');
            main.style.marginTop = '25vh';
        } else {
            setTimeout(() => {
                this.classList.remove('planer-active-up', 'planer-active-down', 'planer-active-down-up');
                main.style.marginTop = '20vh';
            }, 300);
            this.classList.add('planer-active-down-up')

        }
    }

    planer.addEventListener('click', showInfo);
    window.addEventListener("load", () => load(key, lastEndpoint, offset, 'G', 'en'));
    window.addEventListener("scroll", debounce(checkOnEnd, 100));
    window.addEventListener("scroll", animateFixNav);
    buttons.forEach(btn => btn.addEventListener('click', () => {
        btn.name !== 'liked' ? load(key, btn.name, 0, 'G', 'en') : openLiked();
    }));
    panel.addEventListener('mouseleave', () => panel.style.display = 'none');
    sides.forEach(side => side.addEventListener('click', (e) => {
        switch (side.dataset.func) {
            case 'like': like(e.target.parentNode.dataset.url);
                break;
            case 'copyClipBoard': copyClipBoard(e.target.parentNode.dataset.url);
                break;
        }
    }));
}());
