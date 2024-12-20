import React, { Component, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
import { DataFilter } from './styled';

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div
    style={{
      cursor: 'pointer',
      // marginLeft: '10px',
      display: 'flex',
      alignItems: 'center',
    }}
    onClick={onClick}
  >
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

export default class Calendar extends Component {
  state = {
    customSelectedInitial: 0,
    customSelectedEnd: 0,
  };
  render() {
    const { customSelectedInitial, customSelectedEnd } = this.state;
    const { onChange, date } = this.props;

    return (
      <DataFilter>
        <DatePicker
          selected={date}
          onChange={onChange}
          locale={ptBR}
          placeholderText="Data inicial"
          dateFormat="dd/MM/yyyy"
          selectsStart
          startDate={customSelectedInitial}
          endDate={customSelectedEnd}
          customInput={<CustomCalendarInput />}
        />
      </DataFilter>
    );
  }
}
