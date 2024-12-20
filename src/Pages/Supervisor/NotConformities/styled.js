import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }

  div.content {
    ul.pagination {
      padding: 10px 0px !important;
      li.active {
        background-color: #bd207b !important;
      }
    }
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

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 10px;
  width: 100%;

  flex-wrap: wrap;
  @media (max-width: 768px) {
    padding: 0;
  }

  label.labelIncoformity {
    width: 100%;
  }

  div.calendar {
    @media (max-width: 768px) {
      padding-left: 10px;
    }
  }

  button.delete {
    width: 100%;
  }

  div.contentIncoformity {
    display: flex;
    flex-wrap: wrap;

    border: 1px solid rgb(204, 204, 204);
    border-radius: 5px;
    padding: 5px;
    width: 100%;
    margin-bottom: 10px;
  }

  div.react-datepicker-wrapper {
    margin-left: 0 !important;
    position: unset !important;
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

export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 720px) {
    flex-direction: column;
  }

  div.lineTopFilter {
    padding-top: 10px;
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
    div {
      display: flex;
      justify-content: space-between;
    }
  }
  .filterTypeSchedule {
    /* justify-content: center; */
  }
  .filterTypeSchedule,
  .filterSituation {
    padding: 0 5px 5px 5px;
    font-weight: 700;
    text-transform: none;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  justify-content: ${(props) => (props.justifyContent ? props.justifyContent : 'unset')};
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  min-width: ${(props) => props.flex && '270px'};
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  h5 {
    color: #bd207b;

    span {
      font-weight: bold;
    }
  }
  p.paragraphAction {
    font-size: 1.2rem;
    font-weight: 500;
  }

  div.chips {
    /* display: flex; */
  }
  div.chip {
    display: flex;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    @media (max-width: 768px) {
    }
    /* white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 5px !important; */
  }

  .calendarMultipleDays {
    font-weight: 700 !important;
    margin-bottom: 5px;
    color: #000;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '700' : props.fontWeight)};
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
`;

export const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
`;
