import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  .col.s12.element {
    display: ${props => props.tabs === 0 ? "block" : "none"};
  }
  .col.s12.tabClient {
    display: ${props => props.tabs === 1 ? "block" : "none"};
  }
  /* height: 100vh; */
  /* overflow-y: auto;
  width: calc(100vw - 60px); */
  
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
  .filter,
  .topLine {
    margin-top: 10px;
  }

  .newSchedule {
    margin-left: 0px !important;
    padding: 10px;
  }

  .element {
    padding: 0;
  }
  .collapsible {
    box-shadow: none !important;
  }
  .collapsible-header {
    font-weight: 400 !important;
    font-size: 1rem !important;
  }

  .contentClients {
    @media (max-height: 768px) {
      max-height: 280px;
      height: 280px;
    }
    @media (min-height: 780px) {
      max-height: 320px;
      height: 320px;
    }

    @media (max-width: 720px) {
      padding: 0 !important;
    }

    table tbody {
      display: block;
      max-height: 250px;
      @media (max-height: 768px) {
        max-height: 250px;
      }
      @media (min-height: 780px) {
        max-height: 300px;
      }

      overflow-y: scroll;
    }

    table thead tr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 10px 5px;
      td {
        flex: 1;
        padding: 0px 6px !important;
        @media (max-width: 768px) {
          padding: 0 !important;
        }
      }

      td.th-checkAll {
        flex: 0;
        padding: 0 !important;
      }
      td.th-cod {
        padding-left: 0;
      }
      td.th-razaoSocial {
        flex: 10;
        /* padding-left: 12px; */
      }

      @media (max-width: 720px) {
        padding-left: 0 !important;
        td.th-razaoSocial {
          flex: 3;
          /* padding-left: 0 !important; */
        }
        td.th-checkAll {
          flex: 0;
          /* padding-right: 0 !important; */
        }
        td.th-cod {
          /* padding-left: 0 !important; */
        }
      }
    }

    table thead,
    table tbody tr {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      width: 100%;
      table-layout: fixed;
      z-index: 2;
      position: relative;
      top: 0;
      td {
        flex: 1;
        align-items: flex-start;
        display: flex;
        justify-content: center;
        flex-direction: column;

        padding: 0 5px !important;
      }
      td.checkClient {
        flex: 0;
        align-items: center;
        display: flex;
      }

      td.td-nameClient {
        flex: 10;
      }

      @media (max-width: 720px) {
        td {
          padding: 0 !important;
        }
        td.td-nameClient {
          flex: 3;
          align-items: flex-start;
        }
      }
    }
  }

  .newSchedule div table tbody tr td label,
  .newSchedule div table thead td label {
    padding: 0px 0px 0px 10px;
  }

  .newSchedule div table tbody tr td p {
    font-weight: 700;
    padding: 2px 0px 0px 0px;
  }

  .newSchedule div table tbody tr td small {
    font-weight: 400;
    padding: 0px 0px 0px 2px;
  }

  .newSchedule div table {
    color: #858585;
    font-weight: 500;
    line-height: 0.9rem;
  }

  .newSchedule div table thead {
    border-bottom: 1px solid #ccc;
  }
`;

export const ContentModal = styled.div`
  .modal {
    width: 80% !important;
  }

  .modal-footer {
    button {
      background-color: #bd207b !important;
      border-color: #bd207b !important;
    }
  }
`;
export const ContentHeaderModal = styled.div`
  background: #7e3a9d;
`;

export const ContentBodyModal = styled.div`
  // background: #7e3a9d;
  border: 1px solid #c2c2c2;
  border-radius: 5px;

  > div {
    padding: 0;
  }
`;

export const UploadFile = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: flex-start;

  /* padding-left: 8px !important; */
  label {
    @media (max-width: 768px) {
      width: 100%;
    }
    height: 36px;
  }
  input[type='file'] {
    display: none;
  }
`;

export const Linha = styled.div`
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

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
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

  label.labelPeriodDate {
    margin-left: 10px;
  }

  div.contentPeriod {
    display: flex;
  }

  div.fixedDays {
    margin-left: 10px;
  }

  div.react-datepicker-popper {
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

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.paddingLess && props.paddingLess ? '0px 3px 3px 3px' : '0px 10px 10px 10px')};
  text-align: left;
  line-height: 0.9rem;

  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
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

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '700' : props.fontWeight)};
  margin-bottom: 5px;
`;

export const LinhaKanban = styled.div`
  width: 100%;
  background-color: white;
  display: flex;
  overflow-x: auto;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

export const Kanban = styled.div`
  color: #555555;
  height: auto;
  min-width: 300px;
  /* min-height: 50px; */
  max-width: 300px;
  margin-right: 15px;
  border: ${(props) => (props.cor !== undefined ? '1px solid ' + props.cor + '99' : '1px solid #ccc')};
  border-radius: 10px;
  padding: 0px 10px 0px 10px;
  .botaoSim {
    display: none !important;
  }
`;
export const KanbanContainer = styled.div`
  color: #555555;
  height: auto;
  width: 100%;
  overflow-y: auto;
  padding-top: 5px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 5px;
`;

export const DivBaseKanbanTituloPai = styled.div`
  background-color: ${(props) => (props.cor !== undefined ? props.cor : 'white')};
  color: white;
  padding-left: 5px;
  margin-top: 5px;
  border-radius: 4px;
`;

export const DivBaseKanban = styled.div`
  padding-left: 0px;
  padding-right: 0px;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 0px 4px 2px #ccc;
  /* ${(props) => (props.alerta ? '#c0392b' : '#2ecc71')}; */
  margin-bottom: 10px;
  width: 95%;
`;

export const Line = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1;

  /* div.TipoAgendamento {
    margin: 0 10px;
  } */
`;
