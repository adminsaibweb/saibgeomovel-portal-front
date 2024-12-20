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
  .filter {
    margin-top: 10px;
  }
  .primeiraLinha {
    padding-top: 10px;
  }
  .contentSubTitle {
    padding: 0;
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
  }
  .chips {
    border-bottom: 0.1px solid #9e9e9e !important;
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
    padding: 0px;
    margin-bottom: 10px;
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    border-color: #ccc;
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

  a,
  button {
    width: 100% !important;
    padding-bottom: 10px;
  }
  button {
    height: 2rem !important;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const DivDetalhe = styled.div`
  width: ${(props) => (props.description ? '75%' : 'unset')};
  display: flex;
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  min-width: 200px;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    padding-top: 0px;
  }
  img {
    margin-top: 3px;
    height: 50px;
    width: 50px;
  }
  select {
    display: block;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) =>
    props.fontWeight === undefined ? '500' : props.fontWeight};
  /* white-space: nowrap; */
`;

export const SubTitulo = styled.h6`
  display: flex;
  align-items: center;
  color: #666666;
  font-weight: 600 !important;
  padding-bottom: 0px;
  margin-bottom: 0px;
  margin-top: 30px;
  text-transform: initial !important;
`;

export const LinhaRodape = styled.div`
  border: 1px solid blue;

  display: flex;
  justify-content: flex-start;
  padding-top: 20px;
  background-color: white;
  border-color: #ccc;
  border-style: solid;
  border-width: 1px 0px 0px 0px;
  /* margin: 20px 10px 10px 10px; */
  background-color: white;
  padding-bottom: 10px;

  width: 100%;
  /* position: absolute;
  bottom: 10%;
  right: 2%;
  width: 100%; */
`;
export const DivRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 15px 15px;
  width: 100%;

  button {
    display: flex !important;
    justify-content: space-between;
    align-items: center;
    /* width: 10% !impo'rtant; */
    min-width: max-content !important;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    button {
      margin-left: 0 !important;
      padding-left: 10 !important;
      margin-top: 8px !important;
      margin-bottom: 10px !important;
      justify-content: space-between;

      width: 100% !important;
    }
  }
`;
