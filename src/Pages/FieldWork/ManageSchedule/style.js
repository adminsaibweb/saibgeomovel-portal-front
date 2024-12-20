import styled, { css, keyframes } from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 80vh;

  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
  .filter {
    margin-top: 10px;
  }

  > main {
    margin-left: 0.5rem;
    margin-top: 0.5rem;
    width: 98%;
    overflow-y: auto;

    .select {
      background: #d5b5e3 !important;
    }
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  > h2 {
    color: #000;
    font-size: 1rem;
    margin: 0;
    font-weight: 600;
  }
`;

export const DivAgGrid = styled.div`
  height: 11rem;
`;

export const Legend = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;

  .legendRed {
    width: 12px;
    height: 12px;
    border-radius: 100%;
    background-color: #ed3241;
  }
  .legendGreen {
    width: 12px;
    height: 12px;
    border-radius: 100%;
    background-color: #14532d;
  }
  .legendYellow {
    width: 12px;
    height: 12px;
    border-radius: 100%;
    background-color: #e6e600;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 10px; */
  text-align: left;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  position: sticky;
  top: 0;
  padding: 0 4px;
  /* line-height: 0.9rem; */
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  select {
    display: block !important;
  }
  select.selectTypeEmployee {
    border-radius: 5px;
  }

  table {
    /* height: 100%; */

    thead tr {
      position: sticky;
      top: 0;
      background-color: #fff;
      min-height: 200px;
    }
    tbody tr {
      min-height: 150px;

      line-height: 2.5rem;
      color: #000;
      font-weight: 500;
      /* height: 2em; */
      td {
        /* height: 2.5em; */

        .mapButton {
          color: #fff;
          font-size: 1.3rem;
          padding: 12px !important;
        }
        .scheduleButton {
          font-size: 0.9rem;
          padding: 0.4rem 0.5rem !important;

          @media (max-width: 1055px) {
            font-size: 0.8rem;

            > i {
              font-size: 0.8rem;
            }
          }
        }
      }

      td.td-iconAlert {
        display: flex;
        align-items: center;
        i {
          margin: 6px 4px 0 0;
          color: #bd207b;
        }
      }
    }
  }
  .filterBoxScreen {
    display: flex;
    flex-direction: column;
    position: absolute;
    background: white;
    box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);
    border-radius: 10px;
    border: 1px solid #ccc;
    padding: 2px;
    align-items: flex-end;
    input {
      width: 94%;
      margin-right: 5px;
      line-height: 10px;
      height: 32px;
    }
    span {
      padding: 0px 10px;
      margin: 5px 0px;
    }

    .topLineFilterBox {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0px !important;
      margin: 0px !important;
      width: 25px;
      span {
        width: 20px;
      }
    }

    .bottomLineFilterBox {
      display: flex;
      justify-content: space-around;
      flex-direction: row;
      width: 100%;
    }
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const Td = styled.td`
  flex: ${(props) => (props.flex ? props.flex : '1')};
  @media (max-width: 1100px) {
    white-space: ${(props) => props.smaller && 'nowrap'};
    overflow: ${(props) => props.smaller && 'hidden'};
    max-width: ${(props) => props.smaller && '60px'};
    text-overflow: ${(props) => props.smaller && 'ellipsis'};
  }
`;
export const Th = styled.th`
  padding: 5px 5px !important;

  @media (max-width: 1100px) {
    white-space: ${(props) => props.smaller && 'nowrap'};
    overflow: ${(props) => props.smaller && 'hidden'};
    max-width: ${(props) => props.smaller && '60px'};
    text-overflow: ${(props) => props.smaller && 'ellipsis'};
  }
  color: #fff;
`;
export const Tr = styled.tr`
  border: 1px solid #8e44ad;
  background-color: ${(props) => (props.clicked ? '#8e44ad29' : 'unset')};
`;

export const DivFilter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  i {
    margin-right: 5px;
    cursor: pointer;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  margin: 5px;
  display: flex;
  align-items: stretch;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
`;

export const DivSelect = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 0.9rem;

  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  margin-top: 20px;
  @media (max-width: 768px) {
    padding-top: 0px;
  }
  @media (max-width: 450px) {
    padding-top: 0px;
    .calendarOneDay,
    .calendarMultipleDays {
      display: flex;
      justify-content: center;
    }
  }
  div.contentBodyModal {
    display: flex;
    flex-direction: column;
  }
  div.contentSelect {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    label {
      margin-left: 10px;
    }
  }
  label.clientesSelectedDate {
    white-space: nowrap;
  }
  select.optionsStates {
    display: block;
  }
  .fluxosSupervisoresChips,
  .supervisoresChip {
    flex-direction: column;
    div.chip {
      width: max-content;
    }
    /* input.input {
      display: none;
    } */
  }
  div.selectStatus {
    display: flex;
    flex-direction: column;
  }
`;

export const LinhaSelect = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;
  /* text-transform: capitalize; */
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: 100%; */
    /* align-items: center; */
  }

  .TipoAgendamento,
  .DiaSemanaAgendamento {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin-bottom: 10px;
    /* padding: 10px 0px; */
    justify-content: center;

    width: 100% !important;
  }

  .content {
    padding: 10px;
  }
  .divTipoAtividade {
    padding-bottom: 0;
  }

  tbody td.datesSelected {
    display: flex;

    p {
      margin-right: 5px;
    }
  }
  tbody {
    line-height: 1.2rem;
    tr.active {
      background-color: #8e44ad1c !important;
      /* background-color: rgb(223, 178, 251) !important; */
      /* color: #fff !important; */
    }
  }

  .react-datepicker-wrapper {
    /* margin: 0px 10px 10px 0px !important; */
    max-width: 100px;
  }
  .react-datepicker__input-container {
    input {
      font-size: 0.9rem !important;
      font-weight: 700 !important;
      border-bottom: 0px !important;
      margin-bottom: 0px !important;
      height: 30px;
    }
  }

  .react-datepicker {
    border: unset;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    button {
      background-color: #8e44ad !important;
    }
  }

  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__day:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__day--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: white;
    color: rgba(0, 0, 0);
  }

  .react-datepicker__header {
    background-color: #8e44ad;
  }

  .react-datepicker__header div {
    color: white !important;
  }
  .react-datepicker__header {
    border-bottom: unset;
  }

  .react-datepicker__today-button {
    background: #8e44ad;
    color: white;
    border-top: unset;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .react-datepicker__header {
    color: white;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c;
  }

  .react-datepicker__month-text:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--in-range {
    background-color: #bf1f7c !important;
  }
  div.chip {
    justify-content: space-between;
    @media (max-width: 450px) {
      width: 100%;
    }
    p {
      align-items: center;

      @media (max-width: 450px) {
        width: calc(100% - 10px);
        word-wrap: break-word;
        white-space: nowrap;
        overflow: hidden;

        text-overflow: ellipsis;
      }
    }
  }
  > button.waves-effect waves-light saib-button {
    margin: 0 5px 10px 0;
  }
  div.fluxosSupervisoresChips input.input {
    display: ${(props) => (props.displayNoneInputChipFlowPromoter ? 'none !important' : 'inline-block')};
  }
  div.promotoresChip input.input {
    display: ${(props) => (props.displayNoneInputChipPromoter ? 'none !important' : 'inline-block')};
  }
  div.fluxosPromotoresChips input.input {
    display: ${(props) => (props.displayNoneInputChipFlowPromoter ? 'none !important' : 'inline-block')};
  }
  div.supervisoresChip input.input {
    display: ${(props) => (props.displayNoneInputChipSupervisores ? 'none !important' : 'inline-block')};
  }
`;

export const Line = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;

  /* div.TipoAgendamento {
    margin: 0 10px;
  } */
`;

export const ContentDate = styled.div`
  font-weight: 700;
  flex-direction: row;
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => (props.justify ? props.justify : 'center')};
  flex: 1;
  top: 9px;
  /* position: relative; */
  font-weight: 700;

  height: 100%;

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  div.contentPeriod {
    display: flex;
  }

  div.fixedDays {
    margin-left: 10px;
  }

  div.react-datepicker__tab-loop {
    z-index: 10 !important;
    left: unset !important;
    right: calc(100vw - 150px) !important;

    @media (max-width: 768px) {
      left: 0 !important;
      right: unset !important;
    }
  }

  span {
    font-weight: 400 !important;
  }

  div button,
  div {
    cursor: ${(props) => (props.disabled ? 'default !important' : 'pointer')};
  }

  .react-datepicker-wrapper {
    /* margin: 0px 10px 10px 10px; */
    max-width: 100px;
  }
  .react-datepicker__input-container {
    input {
      font-size: 0.9rem !important;
      font-weight: 700 !important;
      border-bottom: 0px !important;
      margin-bottom: 0px !important;
      height: 30px;
    }
  }

  .react-datepicker {
    border: unset;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    button {
      background-color: #8e44ad !important;
    }
  }

  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__day:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__day--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: white;
    color: rgba(0, 0, 0);
  }

  .react-datepicker__header {
    background-color: #8e44ad;
  }

  .react-datepicker__header div {
    color: white !important;
  }
  .react-datepicker__header {
    border-bottom: unset;
  }

  .react-datepicker__today-button {
    background: #8e44ad;
    color: white;
    border-top: unset;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .react-datepicker__header {
    color: white;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c;
  }

  .react-datepicker__month-text:hover {
    background-color: #bf1f7c4f !important;
  }

  .react-datepicker__month--selected {
    background-color: #bf1f7c !important;
  }

  .react-datepicker__day--in-range {
    background-color: #bf1f7c !important;
  }

  ${(props) =>
    props.loading === 1
      ? css`
          .material-icons {
            animation: ${rotate} 2s linear infinite;
            display: block;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
            position: absolute;
            top: 1px;
          }
        `
      : css`
          .material-icons {
            animation: unset;
            display: none;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
          }
        `};
`;

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const HeaderDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
