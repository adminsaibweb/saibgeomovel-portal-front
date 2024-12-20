import styled, { css, keyframes } from 'styled-components';

export const Container = styled.div`
  /* width: 100%; */
  /* min-width: 20%; */
  padding-left: 15px;
  overflow-y: scroll;
  height: calc(100vh - 100px);

  min-width: ${(props) => (props.disableMinWidth ? 'none' : '380px')};
  @media (max-width: 1366px) {
    min-width: none;
  }

  div.contentCenter {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  div.collapsible-header {
    font-weight: 400;
    font-size: 1.3rem;
    padding: 1px 5px !important;
  }

  .collapsible {
    width: ${(props) => (props.typeCalendar !== '1' && props.disableMinWidth ? '300px' : '100%')};
    box-shadow: none !important;
    border: none !important;
  }
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
    display: flex;
    justify-content: center;
    padding-left: 5px;

    button.allMonth {
      height: max-content;
      margin-left: 5px;
    }

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

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const ContentCards = styled.div`
  display: flex;
  flex-direction: column;

  padding: 0 5px;
`;
