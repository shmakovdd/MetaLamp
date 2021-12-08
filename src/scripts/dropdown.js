import { words } from "lodash"

export default class Dropdown {
    constructor(elem, categories ) {
        this.categories = categories
        this.$parentElem = document.querySelector(`${elem}`)
        this.$input = this.$parentElem.querySelector('.input')
        this.$dropDown = this.#createElement({className: 'dropdown'})
        this.$parentElem.appendChild(this.$dropDown)
        this.names = this.getNames()
        this.categoriesCount = this.countForCategories()
        this.$bttnsRow = this.#createElement({className: 'dropdown__bttns-row'})
        this.$clearBttn = this.#createElement({tagName: 'button', className: 'dropdown__clear', innerHTML: 'очистить'})
        this.$applyBttn = this.#createElement({tagName: 'button', className: 'dropdown__apply', innerHTML: 'применить'})
        this.#createOptions(this.names)
        this.#appendChildTo(this.$bttnsRow, [ this.$clearBttn, this.$applyBttn ])
        this.$dropDown.appendChild(this.$bttnsRow)
        this.#setup()
    }


    getNames() {
        let array = []
        for (let key of this.categories.keys()) {
            key.forEach(item => array.push(item))
        }
        return array
    }

    countForCategories() {
        let obj = new Map()
        for (let key of this.categories.keys()) {
            obj.set(key, 0)
        }
        return obj
    }

    setStringForInput() {
        let strings = []
        this.categoriesCount.forEach((value, key) => {
            let word = this.getDecWord(value, key)
            let number = value
            if (number > 0) {
                let string = ` ${number} ${word}`
                strings.push(string)
            } 
        })
        strings.join(',')
        return strings
    }

    increaseCategorieVal(name) {
        for (let key of this.categoriesCount.keys()) {
            if(key.find(item => item == name.innerHTML)) {
                this.categoriesCount.set(key, this.categoriesCount.get(key) + 1)
            } 
        }
    }
    decreaseCategorieVal(name) {
        for (let key of this.categoriesCount.keys()) {
            if(key.find(item => item == name.innerHTML)) {
                this.categoriesCount.set(key, this.categoriesCount.get(key) > 0 ? this.categoriesCount.get(key) - 1 : this.categoriesCount.get(key))
            } 
        }
    }

    #setup() {
        this.$parentElem.addEventListener('click', e => {
            this.open()
        })
        document.addEventListener('click', e => { 
            if (!this.$parentElem.contains(e.target)) {
                this.close()
            }
            if (e.target.classList.contains('dropdown__bttn-pls')) {
                e.preventDefault()
                let $parent = e.target.parentNode
                let $name = $parent.querySelector('.dropdown__name')
                let $value = $parent.querySelector('.dropdown__value')
                let $minusBttn = $parent.querySelector('.dropdown__bttn-mns')
                this.increaseValue($value)
                this.setButtonDisabled($minusBttn, +$value.innerHTML)
                this.increaseCategorieVal($name)
                let string = this.setStringForInput()
                this.$input.value = string
            }
            if (e.target.classList.contains('dropdown__bttn-mns')) {
                e.preventDefault()
                let $parent = e.target.parentNode
                let $name = $parent.querySelector('.dropdown__name')
                let $value = $parent.querySelector('.dropdown__value')
                let $minusBttn = $parent.querySelector('.dropdown__bttn-mns')
                this.decreaseValue($value)
                this.setButtonDisabled($minusBttn, +$value.innerHTML)
                this.decreaseCategorieVal($name)
                let string = this.setStringForInput()
                this.$input.value = string
            }
            if (e.target.classList.contains('dropdown__clear')) {
                e.preventDefault()
                this.clear()   
            }
        })
    }


    clear() {
        this.$input.value = ''
        this.$parentElem.querySelectorAll('.dropdown__value').forEach(item => item.innerHTML = '0')
        this.categoriesCount = this.countForCategories()
        this.$parentElem.querySelectorAll('.dropdown__bttn-mns').forEach(item => item.disabled = true)
    }

    setButtonDisabled(elem, value) {
        if (value == 0) {
            elem.disabled = true
        } else {
            elem.disabled = false
        }
    }

    getSumOfValues() {
        let sumValue = 0
        this.$parentElem.querySelectorAll('.dropdown__value').forEach(item => sumValue+= +item.innerHTML)
        return sumValue
    }

    getDecWord(value, group) {

        let wordsArray
        for (let key of this.categories.keys()) {
            if (key == group) wordsArray = this.categories.get(key)
        }
        let n = Math.abs(value) % 100;
        let n1 = n % 10; 
        if ((n >= 5 && n <= 20) || (n1 >= 5 && n1 <= 10) || n1 == 0) { return wordsArray[2]; }
        if (n1 > 1 && n1 < 5) { return wordsArray[1]; }
        if (n1 == 1) { return wordsArray[0]; }
    }

    increaseValue(elem) {
        let currentVal = +elem.innerHTML
        elem.innerHTML = `${++currentVal}`
    }

    decreaseValue(elem) {
        let currentVal = +elem.innerHTML
        elem.innerHTML = `${--currentVal}`
    }

    #createOptions(names) {
        for (let i = 0; i < names.length; i++) {

            let $option = this.#createElement({className: 'dropdown__option', attrs: {'data-id': `${i}`}})
            let $optionName = this.#createElement({className: 'dropdown__name', innerHTML: names[i]})
            let $minusBttn = this.#createElement({tagName: 'button', className: 'dropdown__bttn-mns', innerHTML: '-', attrs: {disabled: 'disabled'}})
            let $optionVal = this.#createElement({className:'dropdown__value', innerHTML: '0'})
            let $plusBttn = this.#createElement({tagName: 'button', className: 'dropdown__bttn-pls', innerHTML: '+'})

            this.#appendChildTo($option, [$optionName, $minusBttn, $optionVal, $plusBttn])

            this.$dropDown.appendChild($option)
        }
    }

    #appendChildTo(elem, childs) {
        for (let i = 0; i < childs.length; i++) {
            elem.appendChild(childs[i])
        }
    }

    #createElement({tagName = 'div', className = '', attrs = {}, innerHTML = ''} = {}) {
        let $elem = document.createElement(tagName)
        $elem.classList.add(className)

        if (innerHTML) {
            $elem.innerHTML = innerHTML
        }

        if (attrs) {
            for (let attr in attrs) {
                $elem.setAttribute(attr, attrs[attr]);
            }
        }
        return $elem
    }

    open() {
        this.$dropDown.classList.add('open')
    }

    close() {
        this.$dropDown.classList.remove('open')
    }
}
