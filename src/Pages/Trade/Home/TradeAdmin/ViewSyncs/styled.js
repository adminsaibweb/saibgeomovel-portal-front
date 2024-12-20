import styled from 'styled-components';

export const LineSyncs = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  width: 100%;
  border-bottom: 1px solid #c2c2c2;
  padding-bottom: 2px;
  gap: 4px;

  > span {
    font-weight: 700;
    color: #8e44ad;
    font-size: 1rem;
  }
`;

export const ContentSyncs = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
`;

export const ContainerDatas = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  padding: 0 0.6rem;

  > h5 {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
  }
`;

export const DataFilter = styled.div`
  flex: 1;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.2rem;
  position: relative;
  font-weight: 700;

  margin: 0;
  padding: 0;

  > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    > h5 {
      color: #9e9e9e;
      font-size: 1rem;
      font-weight: bold;
    }
  }

  > div + div {
    margin-left: 2rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 6px;
  }
  .react-datepicker-wrapper {
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
`;

export const Dialog = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60%;
  width: 60%;
  z-index: 999;
  background: #fff;
  padding: 0 1rem;
  overflow-x: hidden;
  overflow-y: hidden;

  position: fixed;
  top: 0;
  left: 0;

  > div {
    width: 100%;

    > h3 {
      color: #bf1f7c;
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
      margin: 0;
    }

    > span {
      color: #000;
      font-size: 1.2rem;
      font-weight: 400;
      margin-bottom: 1rem;
    }
  }

  @media (max-width: 768px) {
    height: 100dvh;
    height: 100vh;
    width: 100vw;
  }
`;
