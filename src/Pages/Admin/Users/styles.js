import styled from 'styled-components';

export const ContainerWindowTitle = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 50px;

  @media (max-width: 768px) {
    margin-top: 0px;
    margin-left: 0px;
  }
`;

export const Container = styled.div`
  padding: 0px 10px 0px 10px;
  background-color: #fff;
  height: 100vh;
  margin-left: 64px;
  @media only screen and (max-width: 768px) {
    margin-left: 0px;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: nowrap;
  width: 100%;
  justify-content: space-between;
  padding-top: 10px;
  padding-bottom: 5px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
  div {
    padding-right: 10px;
  }
  input[type='checkbox'] {
    opacity: inherit !important;
    position: inherit !important;
    pointer-events: inherit !important;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: 768px) {
    padding-top: 10px;
  }
`;

export const LinhaRodape = styled.div`
  padding-bottom: 20px;
  padding-top: 20px;
  padding-right: 25px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: white;
  border-color: #ccc;
  border-style: solid;
  border-width: 1px 0px 0px 0px;
  margin: 10px 10px 0px 10px;
  background-color: white;
`;

export const DivRodape = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  button {
    align-items: center;
    display: flex !important;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    button {
      margin-left: 6px !important;
      margin-top: 8px !important;
      margin-bottom: 10px !important;
      justify-content: center;
      width: 100% !important;
    }
  }
`;

export const SubTitulo = styled.h6`
  background-color: white;
  color: #666666;
  @media (max-width: 768px) {
    background-color: #f2f2f2;
    text-transform: uppercase;
    text-align: center;
  }
  font-weight: 600 !important;
  padding-bottom: 0px;
  margin-bottom: 0px;
  margin-top: 30px;
  background-color: ${(props) =>
    props.enfaseTotal === 'true' ? '#f2f2f2' : 'white'};
  padding: ${(props) => (props.enfaseTotal === 'true' ? '10px' : '0px')};
  text-transform: ${(props) =>
    props.enfaseTotal === 'true' ? 'uppercase' : 'normal'};
  text-align: ${(props) =>
    props.enfaseTotal === 'true' ? 'center' : 'normal'};
`;
