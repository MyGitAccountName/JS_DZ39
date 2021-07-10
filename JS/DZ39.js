$(function () {
//$(document).ready(function(){
    // Задача: создать список дел с возможность добавления/удаления пунктов
    let $list = $('#ul');
    let $newItemButton = $('#newItemButton');
    let $newItemForm = $('#newItemForm');
    let $itemDescription = $('#itemDescription');
    let list = [];
//    let $li = $('li');
//    let pages = [];
//    let itemText = ''; // будет хранить текст из текстового поля


/*    function delete_cookie ( cookie_name )
    {
        $.removeCookie(cookie_name);
        $.removeCookie(cookie_name, {path: `'/'`});
    }*/


    // Инициализация (запись в массив исходных данных)
    // При "пустом" cookie записать исходный список в массив
    if (!$.cookie(`list`)) {
        for (let i = 1; i <= $("#ul li").length; i++) {
            list.push({
                name: $(`#ul li:nth-of-type(${i}) .item`).text(),
                date: $(`#ul li:nth-of-type(${i}) .date`).text()
            });
        }
    }
    // При наличии данных в cookie переписать список.
    else {
        list = JSON.parse($.cookie('list'));
        $list.empty();
        list.forEach(item => {
            appendItem(item.name,item.date);
        });
    }

    // скрываем начальный список и затем плавно его выводом по элементно с задержкой
    $list.children().hide().each(function (index) {
        // delay - задержка перед первоначальным появление элемента
        // fadeIn - плавно повление, посредством изменения свойства opacity
        $(this).delay( 1000 * index).fadeIn(1000);
    });

    // показать количество дел
    function updateCounter() {
        //$('#counter').text($('li').length);
        //$('#counter').text(list.length);
        $('#counter').text(`${list.length} ${declination(list.length, 'дело','дела','дел')}`);
    }
    updateCounter();

    // подготовка к добавлению элементов
    $newItemForm.hide();
    $('#showForm').on('click', (event) => {
        event.preventDefault(); // позволяет отменить стандартную функциональность элемента. Пример: если прописать e.preventDefault() для ссылки, то это отменит переход по ней по причине блокировки клика. НО в дальнейшем мы можем сделать свои действия по клику на объект (допустим строчки ниже)
        $newItemButton.hide();
        $newItemForm.show();
        $itemDescription.focus();
    });

    // Запись cookie в JSON
    function saveList() {
        let forCookie = JSON.stringify(list);
        console.log(forCookie);
        $.cookie('list',forCookie);
    }

    // Функция для добавления нулей в строку даты
    function addZero(a) {
        return (a < 10) ? `0${a}`: a;
    }

    // Добавление элемента списка (HTML)
    function appendItem(name,date) {
        $list.append(`
            <li>
                <p>
                    <span class="item">${name}</span>
                    <span class="date">${date}</span>
                </p>
                <img src="images/edit.png" class="edit" alt="">
                <img src="images/del.png" class="del" alt="">
            </li>
        `);
    }

    // добавление нового дела
    function addItem () {
        const text = $itemDescription.val().trim(); // берем значение атрибута value
        // .trim() - убирает пробелы, табуляцию, переносы на новую строку в начале и в конце строки
        if (text.length !== 0) {
            // append добавляет в конец
            // prepend добавляет в начало
            // $list.append(`<li>${text}</li>`);

            // дата создания с добавлением нулей
            let date = new Date();
            let textDate = (`${addZero(date.getDate())}.${addZero(date.getMonth()+1)}.${date.getFullYear()} ${date.getHours()}:${addZero(date.getMinutes())}`);

            appendItem(text,textDate);
            $itemDescription.val('');
            $newItemButton.show();
            $newItemForm.hide();

            // новый объект добавляется в массив с дальнейшей записью в cookie
            let obj = {name: text, date: textDate}
            list.push(obj);
            saveList();
            updateCounter();
 //         console.log(list);
        }
    }

    $("#add").on('click', addItem);
    $newItemForm.on('submit', function (e) {
        e.preventDefault();
        addItem ();
    });


    // удаление дел
    $list.on('click', ".del", function () {
        let $elem  = $(this).parent("li");
        list.splice($elem.index(),1);
        console.log(list);
        saveList();
        updateCounter();
        $elem.animate({ opacity: 0, paddingLeft: '+=100px', fontSize: '-=10px'}, 1500, 'swing', () => {
            $elem.remove();
        });
    });

    // редактирование элементов
    $list.on('click', ".edit", function () {
        let $elem = $(this).parent("li").find(".item");
        let $elemNumber = $(this).parent("li").index();
        let $dateField = $(this).parent("li").find(".date");
        let $itemText = $elem.text();

        $elem.attr('contentEditable','true');
        $elem.focus();
        $elem.on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                $elem.attr('contentEditable','false');
                $elem.blur();
                let date = new Date();
                let textDate = (`${addZero(date.getDate())}.${addZero(date.getMonth()+1)}.${date.getFullYear()} ${date.getHours()}:${addZero(date.getMinutes())}`);
                $dateField.text(textDate);
                $itemText = $elem.text();
                let obj = {name: $itemText, date: textDate}
                list.splice($elemNumber,1, obj);
                saveList();
            }
        });
        $(document).on('mouseup', function (e) {
            if (!$elem.is(e.target) && $elem.has(e.target).length === 0) {
                $elem.text($itemText);
                $elem.attr('contentEditable','false');
            }
        });
    });

    // Смещение пальца с блокнота ;)
    $('#hand1').on('mousedown', function () {
        $('#hand1').css("display", "none");
        $('#hand2').css("display", "block");
    });
    $('#hand2').on('mouseup', function () {
        $('#hand2').css("display", "none");
        $('#hand1').css("display", "block");
    });

    // Склонения
    function declination(number, word1, word2, wordMany) {
        if (!(number>=10 && number<=19)) {
            switch (number%10) {
                case 1: return word1;
                case 2:
                case 3:
                case 4: return word2;
                default: return wordMany;
            }
        }
        else return wordMany;
    }
});

// на доработке
/*    function calcHeights() {
        //alert(list.length);
        let h = 0;
        let start = 1;
        for (let i = 1; i <= list.length; i++) {
            h += $(`#ul li:nth-of-type(${i})`).outerHeight();
            if (h > 360) {
                pages.push({"start": start, "end": i-1});
                start = i;
                h = $(`#ul li:nth-of-type(${i})`).outerHeight();
            }
             //console.log(i + ": " + $(`#ul li:nth-of-type(${i})`).outerHeight());
        }

        for (let j=0; j<pages.length; j++)
        console.log(pages[j]["end"]);
    }*/