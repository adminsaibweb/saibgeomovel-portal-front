import styled, { keyframes, css }  from 'styled-components';

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

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start;
  /* padding: 10px; */
  margin-top: 10px;
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  text-align: left;
  margin: 0px 5px 0px 5px;
  @media (max-width: 768px) {
    padding-top: 0px;
  }

  .FiltroSituacaoPedido{
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .FiltroSituacaoPedido p{
    font-weight: 700;
    margin-bottom: 15px;
  }
  .boxFiltroSituacaoPedido{
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 0px 10px 10px 10px;
    flex-wrap: wrap;
  }


  .FiltroTipoVerba{
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .FiltroTipoVerba p{
    font-weight: 700;
    margin-bottom: 15px;
  }
  .boxFiltroTipoVerba{
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 0px 10px 10px 10px;
    flex-wrap: wrap;
  }

`;


export const DivBaseKanbanBase = styled.div`
  display: flex;
  width: 95%;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 5px;
  button.botao-base {
    color: #61098a !important;
    background-color: unset !important;
    text-transform: unset !important;
    /* max-width: 51px !important;
    min-width: 51px !important; */
  }
`;

export const TdTitle = styled.td`
  padding-top: 0px;
  padding-bottom: 2px;
  font-weight: 700;
  width: 30%;
  color: #8870a4;
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
  border: ${(props) =>
    props.cor !== undefined
      ? '1px solid ' + props.cor + '99'
      : '1px solid #ccc'};
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
  background-color: ${(props) =>
    props.cor !== undefined ? props.cor : 'white'};
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

export const ProductCard = styled.div`
  max-width: 150px;
  min-width: 150px;
  /* border: 1px solid rgb(204, 204, 204); */
  border-radius: 4px;
  text-transform: capitalize;
  flex-direction: column;
  font-size: 0.9rem;
  margin-bottom: 10px;
  margin-left: 5px;
  box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
  padding: 2px;
  /* background: linear-gradient(to right, #e6e3e44d, #9b9b9b4d); */
  small {
    font-weight: 700;
  }
  .titleCard {
    white-space: unset !important;
    overflow: unset !important;
    text-overflow: unset !important;
  }
  p {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    /* margin-bottom: 10px !important; */
  }
  li {
    width: 100%;
    margin-left: 2px;
  }
`;

