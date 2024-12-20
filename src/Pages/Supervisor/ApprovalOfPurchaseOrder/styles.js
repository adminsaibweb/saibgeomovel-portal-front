import styled, { keyframes, css } from 'styled-components';

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

  .collapsible {
    width: 100%;
    margin: 0.2rem 0 0.4rem !important;
  }
  .collapsible-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px 5px;
    font-size: 0.9rem;
    font-weight: 900;
    color: white;
    background-color: #8E44AD;
    margin: 0 0.5rem;
}
`;

export const LinhaKanban = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  overflow-x: auto;
  margin: 0.2rem 1rem;

  @media only screen and (max-width: 925px) {
    gap: 0.8rem;
  }
`;

export const Kanban = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;

  border-radius: 10px;

  border: ${(props) => (props.cor !== undefined ? '1px solid ' + props.cor + '99' : '1px solid #ccc')};
`;

export const DivKanbanContainer = styled.div`
  max-width: 450px !important;
  min-width: 300px;
  height: 95%;
  padding: 0px 10px 0px 10px;

  box-sizing: content-box;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar-thumb {
    background: ${(props) => (props.cor !== undefined ? props.cor : 'rgba(136,112,164,0.3)')};
  }
`

export const KanbanContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

export const DivBaseKanbanTituloPai = styled.div`
  background-color: ${(props) => (props.cor !== undefined ? props.cor : 'white')};
  color: #fff;
  padding: 0.1rem 0.7rem;
  border-radius: 4px;
  font-size: 0.9rem;

  margin: 0.4rem 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 95%;
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
  flex: 1;
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
    z-index: 999 !important;
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
`;

export const ContainerPagination = styled.div`
  .pagination {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem;

    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    li.active {
      background-color: #8E44AD !important;
      transition: all 0.2s linear;
      &:hover {
        background-color: rgba(142,68,173,0.94) !important;
      }
    }
    li:nth-child(1) {
      display: flex;
      justify-content: start;
      align-items: flex-start;
      flex: 1;
    }
    li:last-child {
      display: flex;
      justify-content: end;
      align-items: flex-start;
      flex: 1;
    }
    li i {
      color: #8E44AD;
    }
    li.disabled a {
      cursor: default;
      color: #999;
      > i {
        color: #999;
      }
    }

  }
`

export const ButtonFiltered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 10px 0 0 10px !important;

  > button {
    display: flex;
    align-items: center;
    border-radius: 100px;
    padding: 0.5rem 1rem;

    border: none;
    box-shadow: 0px 2px 10px 1px rgba(142,68,173,0.25);
    background: #8E44AD;
    color: #fff;
    font-weight: bold;

    > i {
      margin-right: 3px;
    }

    transition: all 0.2s linear;

    &:hover {
      background: #843fa2;
    }

    @media (max-width: 1060px) {
      margin-left: 0.4rem;
      margin-top: 0.4rem;
    }
  }
`

export const InputCod = styled.input`
  width: 150px;
  border-bottom: 1px solid #ccc !important;
`
