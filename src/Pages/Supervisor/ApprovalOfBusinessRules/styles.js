import styled  from 'styled-components';

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
  /* width: 100%; */
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
  /* min-width: 300px; */
  @media (max-width: 768px) {
    padding-top: 0px;
    /* width: 100%; */
    min-width: unset;
    .detalheLinhaPedido{
      width: 29%!important;
    }
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
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => (props.valor === undefined && '#858585')};
  color: ${(props) => (!isNaN(props.valor) && '#858585')};
  color: ${(props) => (props.color !== undefined &&  props.color)};

  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
`;

export const TdTitle = styled.td`
  padding-top: 0px;
  padding-bottom: 2px;
  font-weight: 700;
  width: 30%;
  color: #8870a4;
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

