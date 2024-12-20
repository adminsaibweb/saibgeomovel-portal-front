import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;

  margin-left: 64px;
  @media only screen and (max-width: 768px) {
    margin-left: 0px;
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

export const TitleTeam = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.8rem;

  > h1 {
    font-size: 1.3rem;
    font-weight: bold;
    text-decoration: underline;
    margin: 0;
    text-transform: initial;
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0px 10px 0px 0.5rem;
  width: 100%;
  text-transform: capitalize;
  flex-wrap: wrap;

  > h1 {
    font-size: 1.3rem;
    font-weight: bold;
    text-decoration: underline;
    margin: 0;
    text-transform: initial;
  }

  @media (max-width: 700px) {
    .collapsible-promoters {
      width: 90% !important;
    }
  }

  @media (max-width: 550px) {
    display: ${(props) => (props.wrap === 'true' ? 'block' : 'flex')};
    .collapsible-top {
      width: 100% !important;
    }
  }

  .chips {
    border-bottom: 0.1px solid #9e9e9e !important;
  }
  .collapsible-header {
    padding-bottom: 4px;
    border-bottom: unset;
    background-color: white;
    color: #858585;
    font-weight: 500 !important;
    font-size: 1rem !important;
    text-transform: capitalize;
    border-radius: 3px;
    /* border: 1px solid #ccc; */
    /* box-shadow: -1px 1px 5px 1px rgba(0,0,0,0.1); */
    /* padding: 0px !important; */
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
  /* justify-content: center; */
  padding: 0px 10px 10px 10px;
  text-align: left;
  line-height: 0.9rem;
  min-width: ${(props) => (props.withOutMinWidth ? 'unset' : '200px')};
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

  > label {
    margin-top: 0.3rem;
  }

  .forceFirstStopManager,
  .forceSecondStopManager {
    [type='radio']:checked + span:after {
      background: #8e44ad !important;
      border-color: #8e44ad !important;
    }
    span {
    }
  }

  input.timeMask {
    margin: 7px 0 1rem;
  }
  select {
    display: block;
  }

  > span {
    margin-top: 0.5rem;
    color: #4d4d4d;
    font-weight: 500;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
  text-transform: none;
  /* white-space: nowrap; */
`;

export const SubTitulo = styled.h6`
  display: flex;
  align-items: center;
  color: #666666;
  font-weight: 600 !important;
  padding-bottom: 0px;
  margin-bottom: 5px;
  /* margin-top: 30px; */
  text-transform: initial !important;

  .groups {
    margin-right: 4px;
  }
`;

export const SubTituloDestaque = styled.h6`
  border: 1px solid #828282;
  border-radius: 10px;
  padding: 10px;
  background-color: #828282;
  color: white;
  width: 100%;
  display: flex;
  align-items: center;
  text-transform: none;
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
  gap: 4px;
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

export const ContentPromoters = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  margin: 2rem 0.8rem 0;

  > h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 700;
  }
`;

export const CreateForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;

  width: 100%;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #8e44ad;
    cursor: pointer;
    border: 0;
    outline: 0;
    border-radius: 50%;
    padding: 0.2rem;

    > i {
      color: #fff;
      font-size: 1.5rem;
    }
  }
`;

export const Form = styled.div`
  display: ${(props) => (props.display === 'true' ? 'block' : 'none')};
  width: 100%;

  transition: all 0.2s linear;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.1rem;
  min-width: 600px;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    outline: none;
    margin: 0;
    padding: 0;
    max-width: 30px;

    > i {
      margin: 0;
      color: #fff;
    }
  }

  > span {
    display: flex;
  }
`;

export const Icons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5%;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    outline: none;
    margin: 0;
    padding: 0;

    > i {
      margin: 0;
      color: #8e44ad;
    }
  }

  @media (max-width: 700px) {
    width: 8%;
  }

  @media (max-width: 450px) {
    margin-left: 6px;
  }
`;
