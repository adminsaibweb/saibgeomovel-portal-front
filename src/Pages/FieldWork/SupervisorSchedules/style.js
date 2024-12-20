import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 1rem;
  width: calc(100vw - 60px);
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
  .filter {
    margin-top: 10px;
  }

  div.rowUser {
    margin-top: 5px;
  }

  div.contentCenter {
    display: flex;
    justify-content: space-between;
  }
`;
export const RowFilter = styled.div`
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};

  display: flex;
  /* align-items: center; */
  justify-content: space-between;
  flex-wrap: wrap;
  flex-direction: column;

  margin-bottom: 15px;

  .rowUser {
    padding: 0;
    /* margin-top: 5px !important; */
  }
  .rowOptions {
    padding: 0;
  }
`;

export const ContentItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #c2c2c2;
  border-radius: 10px;
  margin: 5px;
  margin-top: 5px !important;
  div {
    label.titleItem {
      width: 100%;
      text-align: center;
    }
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ContentInputFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-self: flex-end;
  width: 100%;
  margin-left: 5px;
  align-items: flex-end;
  margin-bottom: 0;

  input {
    margin-bottom: 0;
    margin-left: 12px;
    margin-top: 7px;
  }
  @media only screen and (max-width: 768px) {
    min-width: 100%;
    flex: 1;
  }
  min-width: 350px;
  div.content-input {
    flex: 1;
    min-width: 250px;
    display: flex;
    align-items: center;
    margin-left: 7px;
    input {
      text-transform: capitalize !important;
    }
  }

  span {
    color: #858585 !important;
    font-weight: 300;
  }
  span::after {
    background-color: #8e44ad !important;
    border: 2px solid #8e44ad !important;
    color: #858585 !important;
  }
`;

export const LabelsFilter = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '700' : props.fontWeight)};

  width: 150px;
  min-width: 150px;
  /* overflow: hidden;
  text-overflow: ellipsis; */
  white-space: nowrap;
`;

export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;
  text-transform: capitalize;

  flex-wrap: wrap;
  @media (max-width: 768px) {
    padding: 0;
  }

  button.delete {
    width: 100%;
  }

  a {
    color: #8e44ad;
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
    }
  }

  .input {
    height: 48px;
    display: flex;
    margin: 5px;
    margin-top: 1rem !important;
  }
  .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #858585;
    font-weight: 500;
    text-transform: capitalize;
    /* border: 1px solid #ccc; */
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    padding: 0px !important;
  }
  .collapsible-body {
    /* display: flex !important; */
    padding: 0px;
    margin-bottom: 10px;
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    border-color: #ccc;

    @media (max-width: 720px) {
      flex-direction: column;
    }
  }
  .collapsible {
    box-shadow: unset !important;
    /* padding: unset !important; */
    margin-bottom: 0px !important;
    margin-top: 0px !important;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 01rem;
  }
  .TipoAgendamento,
  .DiaSemanaAgendamento {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin-bottom: 10px;
    /* padding: 10px 0px; */
    justify-content: center;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 10px;
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
  .react-datepicker-popper {
    z-index: 2;
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

  .collapsible-body div.promotoresChips,
  div.supervisoresChips {
    margin-top: 7px !important;
  }

  div.promotoresChips input.input,
  div.supervisoresChips input.input {
    display: ${(props) => (props.displayNoneInputChip ? 'none!important' : 'unset')};
  }

  /* button.waves-effect waves-light saib-button {
    width: 60%;
  } */
`;

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const DataFilter = styled.div`
  font-weight: 700;
  flex-direction: row;
  display: flex;
  height: max-content;
  top: 9px;
  position: relative;
  font-weight: 700;
  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 10px;
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
  justify-content: flex-end;
  flex-direction: column;
  text-align: left;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  .calendarMultipleDays {
    font-weight: 700 !important;
    margin-bottom: 5px;
    color: #000;
  }

  .clientChips .chip {
    height: auto
}
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '700' : props.fontWeight)};
`;

export const ContentDate = styled.div`
  font-weight: 700;
  flex-direction: row;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: max-content !important;

  flex: 1;
  top: 9px;
  /* position: relative; */
  font-weight: 700;

  height: 100%;

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }
  div.contentDate {
    div {
      /* width: 100%; */
      .react-datepicker {
        width: 100%;
        .react-datepicker__month-container {
          width: 100%;
          .react-datepicker__day-name,
          .react-datepicker__day,
          .react-datepicker__time-name {
            width: 2rem !important;
          }
        }
      }
    }
  }

  label.labelPeriodDate {
    margin-left: 10px;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 10px;
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

export const LinhaKanban = styled.div`
  /* width: 100%; */
  height: calc(100vh - 162px);
  background-color: white;
  display: flex;
  overflow-x: auto;
  padding-top: 10px;
  padding-right: 10px;
  padding-left: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 0.9rem;

  padding-bottom: 20px;
`;

export const Kanban = styled.div`
  color: #555555;
  height: auto;
  min-width: 300px;
  flex: 1;
  max-width: 450px !important;

  overflow-y: auto;

  margin-right: 15px;
  border: ${(props) => (props.cor !== undefined ? '1px solid ' + props.cor + '99' : '1px solid #ccc')};
  border-radius: 10px;
  padding: 0px 10px 0px 10px;
  .botaoSim {
    display: none !important;
  }

  @media (max-width: 1366px) {
  }
  @media (max-width: 768px) {
    width: 100%;
    min-width: 95%;
    max-height: 70vh;
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

  [type='checkbox']:checked + span:not(.lever) {
    font-size: 1rem !important;
  }
  input.select-dropdown {
    font-size: 0.9rem;
    word-wrap: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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

  div.filter {
    padding: 10px 10px;
  }
`;

export const ContainerModal = styled.div`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 50;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgb(0, 0, 0, 0.3);

  .content {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    background-color: white;
    max-height: 80%;
    max-width: 80%;
    border-radius: 6px;
    overflow: auto;

    @media (max-width: 639px) {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
    }

    .item-1 {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: space-between;
      background: #8e44ad;
      width: 100%;
      padding: 4px 8px;
      border-top-left-radius: 0.375rem /* 6px */;
      border-top-right-radius: 0.375rem /* 6px */;

      > h2 {
        margin: 0.3rem 0;
        font-size: 1.1rem;
        font-weight: bold;
        color: white;
      }
    }

    .children {
      margin: 0.2rem 0;
      padding: 2px 4px;
      height: 100%;
      width: 100%;
      overflow: auto;
    }

    .button-dialog {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin: 0.2rem 0;
      padding: 0.2rem;
    }
  }
`;

export const CardBox = styled.div`
  display: flex;
  flex-direction: row;
  box-shadow: rgba(0, 0, 0, 0.15) 2.4px 2.4px 3.2px;
  position: relative;
  border-radius: 8px;
`

export const CardStripe = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 20px;
  background-color: ${props => props.color};
  border-radius: 8px 0px 0px 8px;
`

export const CardContent = styled.div`
  display: flex;
  flex-direction: row;
`

export const CardContainer = styled.div`
  border: 1px solid rgba(133, 133, 133, 0.5);
    width: 100%;
    height: auto;
    margin: 4px;
    padding: 16px 8px;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 40px;
    @media (max-width: 768px) {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
`
