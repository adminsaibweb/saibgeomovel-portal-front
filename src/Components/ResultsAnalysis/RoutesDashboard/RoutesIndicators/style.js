import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: calc(100vw - 40px)!important; */
    align-items: center !important;
  }  
`;

export const Line = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => (props.loading === 1 ? 'inherit' : 'flex-start')};
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%!important;
    align-items: center !important;
  }
`;

export const Product = styled.div`
  h6 {
    font-weight: 700;
    font-size: 0.9rem;
    font-weight: 700;
    color: #858585;
  }
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  padding: 0px 10px 0px 10px;
  border-right: 1px solid #ccc;
  flex-wrap: wrap;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: #858585;
`;

export const Indicator = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  h6 {
    font-weight: 700;
    font-size: 0.9rem;
    font-weight: 700;
    color: #858585;
  }
  p {
    font-size: 0.9rem;
    font-weight: 700;
    color: #000;
  }
  background-color: ${(props) =>
    props.selected === true ? '#8e44ad17' : 'unset'};
`;

export const IndicatorsLine = styled.div`
  /* border-left: 1px solid #ccc; */
  padding: 10px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: ${(props) => (props.loading === 1 ? 'column' : 'row')};
  margin-top: 5px;
  margin-bottom: 10px;
  max-height: 400px;
  width: 100%;
  overflow-y: auto;
  @media (max-width: 768px) {
    display: ${(props) => (props.loading === 1 ? 'none' : 'flex')};
    padding: 0px;
    table{
      max-width: calc(100vw - 45px)!important;
    }
  }
  justify-content: flex-start;
  #indicator:hover {
    background-color: unset!important;
    color: unset!important;
    cursor: pointer!important;
    /* font-weight: 900!important;     */
  }
  #product {
  }
  #indicator{
    padding-right: 5px!important;
  }
  tr:hover{
    color: #bd207b;
  }
  td{
    padding-right: 5px!important;    
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
`;


export const Linha = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.color === undefined ? '#858585' : props.color)};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '700' : props.fontWeight};
`;




