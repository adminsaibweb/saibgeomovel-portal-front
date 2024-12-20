import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: calc(100vw - 75px);
  /* min-height: 100vh; */
  background-color: #f1f1f11c;
  margin-left: 64px;
  align-items: flex-start;
  color: #999999;
  .mobileCenter {
    justify-content: flex-start !important;
    /* background-color: red !important; */
  }
  @media (max-width: 768px) {
    margin-left: 0px;
    margin-top: 50px;
    .mobileCenter {
      justify-content: center !important;
      /* background-color: green !important; */
    }
  }
`;

export const Titulo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  background-color: #8e44ad;
  color: white;
  width: 100%;
  text-align: center;
  height: 50px;
  @media (max-width: 768px) {
    height: 50px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    position: relative;
    top: -18px;
    p {
      position: relative;
      top: 10px;
    }
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
    .spaceBetween {
      justify-content: space-between;
    }
    .right {
      text-align: right;
    }
  }
  .confirmarAcerto {
    padding: 0px !important;
    pointer-events: ${(props) => (props.desativar === '1' ? 'none' : 'all')};
  }
  .confirmarAcerto .collapsible {
    pointer-events: ${(props) => (props.desativar === '1' ? 'none' : 'all')};
  }
  .logisticsIndicator {
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
    max-height: 50px;
    min-width: 90px;
    max-width: 90px;

    .logisticsQtde {
      position: relative;
      top: -30px;
      color: #8e44ad;
      font-weight: 700;
      width: 100%;
      text-align: right;
      line-height: 1.4rem;
      font-size: 1.5rem;
    }

    .logisticsLabel {
      position: relative;
      top: -30px;
      color: #8e44ad;
      font-weight: 400;
      width: 100%;
      text-align: right;
      line-height: 0.8rem;
    }

    .logisticsImage {
      position: relative;
      top: -30px;
      width: 32px;
      filter: drop-shadow(0px 1px 4px #848484);
    }
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
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  /* margin: 0px 5px 0px 5px; */
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;

export const DivDetalheItems = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  font-weight: 500px;
  font-size: 1rem;
  margin: 0px 5px 0px 5px;
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) =>
    props.fontSize === undefined ? '1rem' : props.fontSize};
  color: ${(props) => (props.color === undefined ? '#858585' : props.color)};
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
  display: flex !important;
  max-width: 140px;
  min-width: 140px;
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
  button {
    display: flex !important;
    align-items: center;
    width: 100% !important;
    justify-content: center;
    margin-bottom: 3px !important;
    padding: 0px !important;
  }
  .waves-effect waves-light saib-button + .waves-effect waves-light saib-button {
    margin-left: 0px !important;
  }
  i {
    color: white !important;
  }
`;
