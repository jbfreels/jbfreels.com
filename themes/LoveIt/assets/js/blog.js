jQuery(function($) {

    'use strict';

    var _Blog = window._Blog || {};

    _Blog.toggleMobileMenu = function() {
        $('#menu-toggle').on('click', () => {
            $('#menu-toggle').toggleClass('active');
            $('#mobile-menu').toggleClass('active');
        });
    };

    _Blog.toggleTheme = function() {
        $('.theme-switch').on('click', () => {
            $('body').toggleClass('dark-theme');
            isDark = !isDark;
            window.localStorage && window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.echarts();
        });
    };

    _Blog.changeTitle = function() {
        var currentTitle = document.title;
        window.onblur = function() {
            document.title = currentTitle;
        };
        window.onfocus = function() {
            document.title = currentTitle;
        };
    };

    _Blog.dynamicToTop = function() {
        const min = 300;
        var $toTop = $('#dynamic-to-top');
        $(window).scroll(function() {
            var scrollTop = $(window).scrollTop();
            if (typeof document.body.style.maxHeight === 'undefined') {
                $toTop.css({
                    'position': 'absolute',
                    'top': scrollTop + $(window).height() - 20,
                });
            }
            if (scrollTop > min) {
                (function fadeIn(el, display){
                    display = display || "block";
                    if (el.style.display !== display) {
                        el.style.opacity = 0;
                        el.style.display = display;
                        (function fade() {
                            var val = parseFloat(el.style.opacity);
                            if (!((val += .1) > 1)) {
                                el.style.opacity = val;
                                requestAnimationFrame(fade);
                            }
                        })();
                    }
                })(document.getElementById('dynamic-to-top'));
            } else {
                (function fadeOut(el){
                    if (el.style.display !== "none") {
                        el.style.opacity = 1;
                        (function fade() {
                            if ((el.style.opacity -= .1) < 0) {
                                el.style.display = "none";
                            } else {
                                requestAnimationFrame(fade);
                            }
                        })();
                    }
                })(document.getElementById('dynamic-to-top'));
            }
        });
    };

    _Blog.chroma = function() {
        const blocks = document.querySelectorAll('.highlight > .chroma');
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const afterHighLight = block.querySelector('pre.chroma > code');
            const lang = afterHighLight ? afterHighLight.className : '';
            block.className += ' ' + lang;
        }
    };

    _Blog.responsiveTable = function() {
        const tables = document.querySelectorAll('.post-content table');
        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            table.parentElement.replaceChild(wrapper, table);
            wrapper.appendChild(table);
        }
    };

    _Blog._refactorToc = function(toc) {
        // when headings do not start with `h1`
        const oldTocList = toc.children[0];
        let newTocList = oldTocList;
        let temp;
        while (newTocList.children.length === 1
            && (temp = newTocList.children[0].children[0]).tagName === 'UL') {
            newTocList = temp;
        }

        if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList);
    };

    _Blog._linkToc = function() {
        const links = document.querySelectorAll('#TableOfContents a:first-child');
        for (let i = 0; i < links.length; i++) links[i].className += ' toc-link';

        for (let num = 1; num <= 6; num++) {
            const headers = document.querySelectorAll('.post-content>h' + num);
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                header.innerHTML = `<a href="#${header.id}" class="headerlink"></a>${header.innerHTML}`;
            }
        }
    };

    _Blog._initToc = function() {
        const $toc = $('#post-toc');
        if ($toc.length && $toc.css('display') !== 'none') {
            const SPACING = 100;
            const $footer = $('#post-footer');
            const minTop = $toc.position().top;;
            const mainTop = $('main').position().top;
            const minScrollTop = minTop + mainTop - SPACING;
            const changeTocState = function() {
                const scrollTop = $(window).scrollTop();
                const maxTop = $footer.position().top - $toc.height();
                const maxScrollTop = maxTop + mainTop - SPACING;

                const tocState = {
                    start: {
                        'position': 'absolute',
                        'top': minTop,
                    },
                    process: {
                        'position': 'fixed',
                        'top': SPACING,
                    },
                    end: {
                        'position': 'absolute',
                        'top': maxTop,
                    }
                };

                if (scrollTop < minScrollTop) {
                    $toc.css(tocState.start);
                } else if (scrollTop > maxScrollTop) {
                    $toc.css(tocState.end);
                } else {
                    $toc.css(tocState.process);
                }
            };
            changeTocState();

            const HEADERFIX = 100;
            const $toclink = $('.toc-link');
            const $headerlink = $('.headerlink');
            const $tocLinkLis = $('.post-toc-content li');
            const activeIndex = function() {
                const scrollTop = $(window).scrollTop();
                const headerlinkTop = $.map($headerlink, function(link) {
                    return $(link).offset().top;
                });
                const headerLinksOffsetForSearch = $.map(headerlinkTop, function(offset) {
                    return offset - HEADERFIX;
                });
                const searchActiveTocIndex = function(array, target) {
                    for (let i = 0; i < array.length - 1; i++) {
                        if (target > array[i] && target <= array[i + 1]) return i;
                    }
                    if (target > array[array.length - 1]) return array.length - 1;
                    return 0;
                };

                const activeTocIndex = searchActiveTocIndex(headerLinksOffsetForSearch, scrollTop);

                $($toclink).removeClass('active');
                $($tocLinkLis).removeClass('has-active');

                if (activeTocIndex !== -1) {
                    $($toclink[activeTocIndex]).addClass('active');
                    let ancestor = $toclink[activeTocIndex].parentNode;
                    while (ancestor.tagName !== 'NAV') {
                        $(ancestor).addClass('has-active');
                        ancestor = ancestor.parentNode.parentNode;
                    }
                }
            };
            activeIndex();
            if (!this._initTocOnce) {
                $(window).scroll(changeTocState);
                $(window).scroll(activeIndex);
                this._initTocOnce = true;
            }
        }
    };

    _Blog.toc = function() {
        const tocContainer = document.getElementById('post-toc');
        if (tocContainer !== null) {
            const toc = document.getElementById('TableOfContents');
            if (toc === null) {
                // toc = true, but there are no headings
                tocContainer.parentNode.removeChild(tocContainer);
            } else {
                this._refactorToc(toc);
                this._linkToc();
                this._initToc();
                // Listen for orientation changes
                window.addEventListener("resize", function() {
                    this.setTimeout(_Blog._initToc, 0);
                }, false);
            }
        }
    };

    _Blog.echarts = function() {
        if (window.echartsMap) {
            for (let i = 0; i < echartsArr.length; i++) {
                echartsArr[i].dispose();
            }
            echartsArr = [];
            Object.keys(echartsMap).forEach(function(id) {
                let myChart = echarts.init(document.getElementById(id), window.isDark ? 'dark' : 'macarons', {renderer: 'svg'});
                myChart.setOption(echartsMap[id]);
                echartsArr.push(myChart);
            });
            window.addEventListener("resize", function() {
                this.setTimeout(function(){
                    for (let i = 0; i < echartsArr.length; i++) {
                        echartsArr[i].resize();
                    }
                }, 0);
            }, false);
        }
    }

    _Blog.countdown = function() {
        if (window.countdownMap) {
            Object.keys(countdownMap).forEach(function(id) {
                $(`#${id}`).countdown(countdownMap[id]['date'], {elapse: true})
                    .on('update.countdown', function(event) {
                    $(this).html(event.strftime(countdownMap[id]['pattern']));
                });
            });
        }
    };

    _Blog.typeit = function() {
        if (window.typeitArr) {
            for (let i = 0; i < typeitArr.length; i++) {
                const group = typeitArr[i];
                (function typeone (i) {
                    if (i === group.length - 1) {
                        new TypeIt(`#${group[i]}`, {
                            strings: document.getElementById(`r${group[i]}`).innerHTML,
                        }).go();
                        return;
                    }
                    let instance = new TypeIt(`#${group[i]}`, {
                        strings: document.getElementById(`r${group[i]}`).innerHTML,
                        afterComplete: () => {
                            instance.destroy();
                            typeone(i + 1);
                        },
                    }).go();
                })(0);
            }
        }
    };

    $(document).ready(function() {
        _Blog.toggleMobileMenu();
        _Blog.toggleTheme();
        _Blog.changeTitle();
        _Blog.dynamicToTop();
        _Blog.chroma();
        _Blog.responsiveTable();
        _Blog.echarts();
        _Blog.countdown();
        _Blog.typeit();
        _Blog.toc();
    });
});