import styled, { css, keyframes } from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  width: calc(100vw - 60px);

  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
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

export const Card = styled.div`
  display: flex;
  flex-direction: column;

  width: ${(props) => (props.pwa ? '320px' : '460px')};
  height: max-content;
  flex-grow: 1;
  box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px,
    rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid;
  border-color: rgba(0, 0, 0, 0.2);

  background: #ededed;
  gap: 0.2rem;

  > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 1rem;
    border-bottom: 1px solid #e6e6e6;

    > span {
      font-weight: 800;
      white-space: nowrap;
    }

    .descriptionSpan {
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 400;
      width: 75%;
    }

    .description {
      text-align: left;
      display: inline-block;
      word-wrap: break-word;
      white-space: normal;
      width: 75%;
      font-weight: 400;
    }
  }
`;

export const DataFilter = styled.div`
  font-weight: 700;
  flex-direction: row;
  display: flex;
  top: 9px;
  position: relative;
  font-weight: 700;
  @media (max-width: 768px) {
    margin-bottom: 6px;
  }

  .react-datepicker-wrapper {
    margin: 0px 10px 10px 10px;
    max-width: 150px;
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
      background-color: #61098a !important;
    }
    z-index: 9999 !important;
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
    background-color: #61098a;
  }

  .react-datepicker__header div {
    color: white !important;
  }
  .react-datepicker__header {
    border-bottom: unset;
  }

  .react-datepicker__today-button {
    background: #61098a;
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
          .wait {
            animation: ${rotate} 2s linear infinite;
            display: block;
            color: rgb(189, 32, 123);
            font-size: 1.4rem;
            position: absolute;
            top: 1px;
          }
        `
      : css`
          .wait {
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
  justify-content: space-between;
  align-items: flex-start;
  margin: 0px 5px;

  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;

export const Linha = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 0.5rem;
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
  text-transform: none;
  /* white-space: nowrap; */
`;

export const ButtonDelete = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin: 0.3rem 0;
  width: 100%;
  cursor: pointer;

  background: #ed3241;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;

  padding: 0.5rem;
  border-radius: 100px;
  border: none;
  transition: all 0.2s linear;

  &:hover {
    background: #f15b67;
  }

  > svg {
    border-color: none !important;
    border-style: none !important;
    border-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  > i {
    border-color: none !important;
    border-style: none !important;
    border-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;

    svg {
      border-color: none !important;
      border-style: none !important;
      border-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
`;

export const TextAreaDiv = styled.div`
  width: 100%;

  textarea {
    position: relative;
    resize: none;
    height: 6rem;
    padding: 5px;
    border: none;
    border: 1px solid #b3b3b3;
    margin: 2px;
    color: #000;
    box-shadow: 400;
    font-size: 1.2rem;
  }
`;
