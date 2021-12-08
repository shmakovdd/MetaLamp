import { continueStatement } from "@babel/types";

class EventEmitter {
    constructor() {
      this._events = {};
    }
    on(evt, listener) {
      (this._events[evt] || (this._events[evt] = [])).push(listener);
      return this;
    }
    emit(evt, arg) {
      (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
  }

class PickedDate {
    constructor(target, data, rangeClass) {
        this.target = target
        this.targetData = data
        this.rangeClass = rangeClass
        this.target?.classList.add(rangeClass)
    }

    changeRangeClass(newClassValue) {
        if(this.rangeClass !== undefined) {
            this.target.classList.remove(this.rangeClass);
        }
        this.rangeClass = newClassValue;
        this.target.classList.add(newClassValue);
    }
}

export default class Calendar extends EventEmitter {
    constructor(firstDate, secondDate, options) {
        super()
        this.model = new Model()
        this.view = new View(firstDate, secondDate, options)
        this.view.setCalendar(this.model.createDatesArray(), this.model.month)
        this.view.on('rightBttnClicked', () => this.next())
        this.view.on('leftBttnClicked', () => this.prev())
        this.view.on('setRangeStart', (item) => this.#startRange(item))
        this.view.on('selectingRange', (item) => this.#selectingRange(item))
        this.view.on('setRangeEnd', (item) => this.#endRange(item))
    }

    #startRange(item) {
        if (this.view.isClickedOnSelectedDate(item) == false) {
            this.view.clearInputsValueAndData()
            this.view.removeAllClasses(item)
        } 
        if (item == this.view.firstDate.target) this.view.swapDates()
        if (this.view.isClickedOnSelectedDate(item)) {
            this.view.removeRangeStartInit()
            this.view.rangeSelectingInit()
            this.view.addRangeEndInit() 
            return
        }
        this.view.addSelectClass(item)
        this.view.firstDate.targetData = item.dataset.ms
        this.view.firstDate.target = item
        this.view.firstDate.rangeClass = 'range-start'
        this.view.changeInputValue(this.view.firstInput, this.view.firstDate.targetData)
        this.view.removeRangeStartInit()
        this.view.rangeSelectingInit()
        this.view.addRangeEndInit()
    }

    #selectingRange(item) {
        if (this.view.secondDate.target) {
            $(this.view.secondDate.target).removeClass(`${this.view.secondDate.rangeClass}`)
        }
        this.view.secondDate.targetData = item.dataset.ms
        this.view.secondDate.target = item
        this.view.secondDate.rangeClass = 'range-end'
        this.view.checkAllItemsData()
        this.view.compareDates()
    }

    #endRange(item) {
        this.view.secondDate.targetData = item.dataset.ms
        this.view.addSelectClass(item)
        this.view.changeInputValue(this.view.secondInput, Math.max(this.view.secondDate.targetData, this.view.firstDate.targetData))
        this.view.changeInputValue(this.view.firstInput,  Math.min(this.view.secondDate.targetData, this.view.firstDate.targetData))
        this.view.removeRangeSelectingInit()
        this.view.addRangeStartInit()
        this.view.removeRangeEndInit()
    }


    show() {
        this.view.showContainer()
    }

    destroy() {
        this.view.destroyContainer()
    }

    next() {
        this.model.increaseMonth()
        this.view.setCalendar(this.model.createDatesArray(), this.model.month)
    }
    prev() {
        this.model.decreaseMonth()
        this.view.setCalendar(this.model.createDatesArray(), this.model.month)
    }
}

class Model {
    constructor() {
        this.date = new Date()
        this.months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',]
    }

    decreaseMonth() { 
        this.date.setMonth(this.date.getMonth() - 1)
        this.date.setDate(1)
    }

    increaseMonth() {
        this.date.setMonth(this.date.getMonth() + 1)
        this.date.setDate(1)
    }

    createDatesArray() {
        this.month = `${this.months[this.date.getMonth()]} ${this.date.getFullYear()}`
        this.currentMonth = this.date.getMonth()
        this.lastDateOfCurrentMonth = new Date(this.date.getFullYear(), this.currentMonth + 1, 0).getDate() 
        this.lastDateOfPreviousMonth = new Date(this.date.getFullYear(), this.currentMonth, 0).getDate() 
        this.lastWeekDayOfPreviousMonth = new Date(this.date.getFullYear(), this.currentMonth, 0).getDay()
        let array = []
        for (let i = this.lastDateOfPreviousMonth - this.lastWeekDayOfPreviousMonth + 1; i <= this.lastDateOfPreviousMonth; i++) {
            this.createPreviousMonth(i, array)
        }

        for (let i = 1; i <= this.lastDateOfCurrentMonth; i++) {
            this.createCurrentMonth(i, array)
        }

        for (let i = 1; i <= 42 - this.lastDateOfCurrentMonth - this.lastWeekDayOfPreviousMonth; i++) {
            this.createNextMonth(i, array)
        }

        return array
    }

    createPreviousMonth(i, array) {
        if (this.lastWeekDayOfPreviousMonth == 0) return
        let date = i
        let month = new Date(this.date.getFullYear(), this.date.getMonth() - 1, i).getMonth()
        let year = new Date(this.date.getFullYear(), this.date.getMonth() - 1, i ).getFullYear()
        let cls = 'calendar__day other-month'
        array.push({
            attr: `data-ms="${Date.parse(`${year}, ${month + 1}, ${date}`)}"`, 
            date: i,
            cls: cls
        })
    }

    createCurrentMonth(i, array) {
        let cls = 'calendar__day'
        if (i == new Date().getDate() && this.date.getMonth() == new Date().getMonth() && this.date.getFullYear() == new Date().getFullYear()) cls = 'calendar__day today' 
        let date = i
        let month = this.date.getMonth()
        let year = new Date(this.date.getFullYear(),this.date.getMonth(),  i ).getFullYear()
        array.push({
            attr: `data-ms="${Date.parse(`${year}, ${month + 1}, ${date}`)}"`, 
            date: i,
            cls: cls
        })
    }

    createNextMonth(i,array) {
        let cls = 'calendar__day other-month'
        let date = i
        let month = new Date(this.date.getFullYear(), this.date.getMonth() + 1, i).getMonth()
        let year = new Date(this.date.getFullYear(), this.date.getMonth() + 1, i ).getFullYear()
        array.push({
            attr: `data-ms="${Date.parse(`${year}, ${month + 1}, ${date}`)}"`, 
            date: i,
            cls: cls
        })
    }
}

class View extends EventEmitter{
    constructor(firstInput, secondInput, options) {
        super()
        this.options = options
        this.firstInput = document.querySelector(`${firstInput}`)
        this.secondInput = document.querySelector(`${secondInput}`)
        this.root = document.createElement('div')
        $(this.root).attr('id', 'calendar').addClass('calendar').html(this.getTemplate())
        this.initialCoords = this.getCoords(this.firstInput)
        this.calendarWrapper = document.createElement('div')
        this.calendarWrapper.classList.add('calendar-global-wrapper')
        this.#render()
        this.#setup()
        this.firstDate = new PickedDate()
        this.secondDate = new PickedDate()
    }

    // changeInputArrowDirection(input, text) {
    //     $(input).next().html(text)
    // }

    changeInputValue(input, value) {
        if (Number.isNaN(value)) return
        let date = new Date(+value).getDate()
        let month = new Date(+value).getMonth() + 1
        month = month.toString().length <= 1 ? `0${new Date(+value).getMonth() + 1}` : month;
        let year = new Date(+value).getFullYear()
        let text = `${date}.${month}.${year}`
        $(input).val(text)
    }

    clearInputsValueAndData() {
        $(this.firstInput).val('дд.мм.гггг')
        $(this.secondInput).val('дд.мм.гггг')
        // this.firstDate.targetData = ''

    }

    setCalendarPosition() {

        this.root.style.top = `${this.initialCoords.top + this.initialCoords.height + 20}px`
        this.root.style.left = `${this.initialCoords.left}px`
    }

    addSelectClass(item) {
        $(item).addClass('selected')
    }

    getCoords(elem) { // кроме IE8-
        let box = elem.getBoundingClientRect();
        
        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset,
            width: box.width,
            height: box.height
        };
        
    }

    #render() {
        $(document.body).append(this.calendarWrapper)
        $(this.calendarWrapper).append(this.root)
        if(this.options.inline) {
            this.showContainer()
        } 
    }

    destroyContainer() {
        $(this.root).css('left', '-100000px').removeClass('open')
    }

    showContainer() {
        this.setCalendarPosition()
        $(this.root).addClass('open')
    }

    #setup() {
        if(!this.options.inline) this.setDynamicCalendar()
        $(this.root).on('click', e => {
            if (e.target == $(`.calendar__arrow-left`)[0]) this.emit('leftBttnClicked')
            if (e.target == $(`.calendar__arrow-right`)[0]) this.emit('rightBttnClicked')
        })
        this.addRangeStartInit()
    }

    setDynamicCalendar() {
        $(this.firstInput).on('click', e => {
            this.initialCoords = this.getCoords(this.firstInput)
            this.showContainer()
        })
        $(this.secondInput).on('click', e => {
            this.initialCoords = this.getCoords(this.firstInput)
            this.showContainer()
        })
        window.addEventListener('click', e => {
            let calendar = document.getElementById('calendar');
            if (!calendar.contains(e.target) && e.target !== this.firstInput && e.target !== this.secondInput) {
                this.destroyContainer()
            }
        })
    }

    rangeSelectingInit() {
        $(this.root).children('.calendar__days').on('mouseover', e => {
            if (e.target.classList.contains('calendar__day')) this.emit('selectingRange', e.target)
        })
    }

    addRangeStartInit() {
        $(this.root).children('.calendar__days').on('click', this.rangeStartInit)
    }

    removeRangeSelectingInit() {
        $(this.root).children('.calendar__days').off('mouseover')
    }

    addRangeEndInit() {
        $(this.root).children('.calendar__days').on('click', this.rangeEndInit)
    }

    removeRangeEndInit() {
        $(this.root).children('.calendar__days').off('click', this.rangeEndInit)
    }

    rangeEndInit = (e) => {
        if (e.target.classList.contains('calendar__day')) this.emit('setRangeEnd', e.target)
    }

    rangeStartInit = (e) => {
        if (e.target.classList.contains('calendar__day')) this.emit('setRangeStart', e.target)
    }

    removeRangeStartInit() {
        $(this.root).children('.calendar__days').off('click', this.rangeStartInit)
    }

    getTemplate () {
        return `
            <div class="calendar__month_wrapper">
                <span class="material-icons calendar__arrow-left">
                    arrow_back
                </span>
                <h3 class="calendar__month"></h3>
                <span class="material-icons calendar__arrow-right">
                    arrow_forward
                </span>
            </div>
            <ul class="calendar__weekdays">
                <li class="calendar__weekday">Пн</li>
                <li class="calendar__weekday">Вт</li>
                <li class="calendar__weekday">Ср</li>
                <li class="calendar__weekday">Чт</li>
                <li class="calendar__weekday">Пт</li>
                <li class="calendar__weekday">Сб</li>
                <li class="calendar__weekday">Вс</li>
            </ul>
            <ul class="calendar__days">
                
            </ul>
            </div>
        `
    }

    setCalendar(dates, month ) {
        let items = dates.map(item => {
            return `
            <li class='${item.cls}' ${item.attr}>${item.date}</li>
            `
        })
        items = items.join('')
        $('.calendar__days').html(items)
        $('.calendar__month').text(month)
        this.checkAllItemsData()
    }


    checkAllItemsData() {
        let firstDate = this.firstDate.targetData
        let secondDate = this.secondDate.targetData
        let minValue = Math.min(firstDate, secondDate) 
        let maxValue = Math.max(firstDate, secondDate)
        $('.calendar__day').each((index, item) => {
            if (item.dataset.ms > minValue && item.dataset.ms < maxValue) {
                $(item).addClass('is-in-range')
            } else {
                $(item).removeClass('is-in-range')
            }
            if (item.dataset.ms == firstDate) {
                this.firstDate.target = item
                item.classList.add(this.firstDate.rangeClass)
            }
            if (item.dataset.ms == secondDate) {
                this.secondDate.target = item
                item.classList.add(this.secondDate.rangeClass)
            }
        })
    }

    compareDates() {
        if ( this.secondDate.targetData < this.firstDate.targetData) {
            this.secondDate.changeRangeClass('range-start')
            this.firstDate.changeRangeClass('range-end')
        } else if(this.secondDate.targetData > this.firstDate.targetData) {
            this.secondDate.changeRangeClass('range-end')
            this.firstDate.changeRangeClass('range-start')
        } 
    }

    changeClassFromTo(item, removingClass, addingClass) {
        $(item).addClass(`${addingClass}`)
        $(item).removeClass(`${removingClass}`)
    }

    removeAllClasses() {
        $('.calendar__day').each((index, item) => {
            $(item).removeClass('selected range-start range-end is-in-range')
        })        
    }

    isClickedOnSelectedDate(item) {
        return item.classList.contains('range-start') || item.classList.contains('range-end')
    }

    swapDates() {
        let temp = this.firstDate
        this.firstDate = this.secondDate
        this.secondDate = temp
    }

}