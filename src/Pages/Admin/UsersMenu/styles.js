import styled from 'styled-components';

export const Container = styled.div`
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
  flex-wrap: nowrap;
  width: 100%;
  justify-content: flex-start;
  padding: 4px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
  div {
    padding-right: 10px;
  }
`;

export const DivSelect = styled.div`
  input:focus {
    border: none !important;
    box-shadow: none !important;
    height: 38px !important;
  }

  .sc-gKAblj .eIGroG {
    height: 38px;
  }

  .css-b62m3t-container {
    height: 38px;
  }

  .css-v68sna-control {
    height: 38px;
  }

  .css-1fdsijx-ValueContainer {
    height: 38px;
  }

  .css-qbdosj-Input {
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: start;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;

  .botao-junior {
    display: none !important;
  }
  i {
    margin-right: 10px;
    align-self: center;
  }
  span {
    margin-left: 3px;
  }
  /* span ::before {
    background-color: #8e44ad !important;
  }
  span::after {
    background-color: #8e44ad !important;
    border: 2px solid #8e44ad !important;
  } */

  .tipoUser {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tipoUser-form {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .allSchedule-form {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`;

export const LinhaRodape = styled.div`
  padding-bottom: 20px;
  padding-top: 20px;
  padding-right: 15px;
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
  button.cancell {
    margin-right: 5px;
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
  color: #666666;
  @media (max-width: 768px) {
    text-transform: uppercase;
    text-align: center;
  }
  font-weight: 600 !important;
  padding-bottom: 4px;
  margin: 0;
  border-bottom: 1px solid rgb(122,122,122, 0.3);
  width: 100%;
  padding: ${(props) => (props.enfaseTotal === 'true' ? '10px' : '0px')};
  text-transform: ${(props) => (props.enfaseTotal === 'true' ? 'uppercase' : 'normal')};
  text-align: ${(props) => (props.enfaseTotal === 'true' ? 'center' : 'normal')};
`;

export const DivMenus = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const ContentMenus = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const MenuItem = styled.li`
  display: flex;
  flex-direction: column;
  padding: 4px 0px 4px 4px;
  width: 100%;
  label {
    font-size: inherit;
    color: inherit;
  }

  input {
    opacity: 1 !important;
    position: inherit !important;
    pointer-events: auto !important;
  }

  .dropdown-content {
    width: 300px !important;
    display: flex;
    align-items: flex-start;
    li {
      flex-direction: column;
      align-items: baseline;
      display: flex;
      padding-left: 5px;
    }
  }
  a {
    color: rgba(0, 0, 0, 0.87);
    display: block;
    font-size: 14px;
    font-weight: 500;
    height: 48px;
    line-height: 48px;
    padding: 0px 0px 0px 5px !important;
    width: 100%;
  }

  .line-Menu {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 14px;
  }
`;

export const DivTabs = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export const Tab = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  padding: 12px 0px;
  font-weight: 500;

  cursor: pointer;

  color: ${(props) => (props.status ? '#8e44ad' : '#000')};
  border-bottom: ${(props) => (props.status ? '1px solid #8e44ad' : '1px solid #bfbfbf')};
`;
