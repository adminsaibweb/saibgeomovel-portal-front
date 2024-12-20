import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  width: calc(100vw - 64px);
  height: 100vh;

  margin-left: 64px;
  @media (max-width: 764px) {
    margin-left: 0;
  }

  div.contentButtonsActions {
    flex-direction: row-reverse;
    width: 100%;
    justify-content: space-between;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: ${(props) => (props.withPadding ? '0px 10px 0px 10px' : '0')};
  width: 100%;
  text-transform: capitalize;

  flex-wrap: wrap;
  @media (max-width: 768px) {
    padding: 0;
  }

  button.delete {
    width: 100%;
  }
  div.divDetailPromoter,
  div.divDetailSupervisor {
    /* padding: 0; */
  }

  div.searchsSelected,
  div.periodSelected,
  div.professionalsSelected {
    background-color: rgb(241, 241, 241);
    display: flex;
    width: 100%;
    margin: 5px 0;
    line-height: 2rem;

    p {
      font-weight: 500;
      text-transform: none !important;
    }

    p.typeProfessional,
    p.professional {
      padding-left: 5px;
    }
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

 label{
   padding: 5px 10px 5px 10px;
 }
  /* button.waves-effect waves-light saib-button {
    width: 60%;
  } */
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
    div {
      display: flex;
      justify-content: space-between;
    }
  }
  .filterTypeSchedule {
    /* justify-content: center; */
  }
  .filterTypeSearch,
  .filterTypeProfessional {
    padding: 0 5px 5px 5px;
    font-weight: 700;
    text-transform: none;
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
  margin-right: 5px;
  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 0;
    max-width: 100px;

    div:first-child {
      margin-left: 0 !important;
    }
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

export const DivDetalhe = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  width: max-content;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  @media (max-width: 768px) {
    padding-top: 0px;
  }
  > p {
    font-weight: 700;
  }
  label {
    width: max-content;
  }
  button {
    width: max-content;
  }
  button.search {
    margin-right: 5px;
  }
  button.print {
    span {
      padding-left: 5px;
    }
  }
  h6 {
    font-weight: 400;
  }
  iframe {
    width: 100vw;
    height: 93vh;
  }
  .calendarMultipleDays {
    font-weight: 700 !important;
    margin-bottom: 5px;
    color: #000;
  }

  div.input-field {
    min-width: 250px;
    margin-bottom: 0 !important;

    input {
      margin: 0 !important;
    }
  }

  div.chips {
    /* width: max-content; */
    min-width: 368px;
    /* max-width: max-content; */
  }
`;
export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '700' : props.fontWeight)};
`;
export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* max-width: calc(100% - 202px); */
  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const ContentQuestion = styled.div`
  display: flex;
  line-height: 2rem;
  border-bottom: 1px solid #c2c2c2;
`;
