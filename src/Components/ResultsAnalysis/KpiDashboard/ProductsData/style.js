import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-width: calc(100vw - 69px);
  min-height: 100vh;
  background-color: #f1f1f11c;
  margin-left: 69px;
  align-items: flex-start;
  @media (max-width: 768px) {
    margin-left: 0px;
    margin-top: 50px;
  }
`;

export const SubContainer = styled.div`
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 0px;
  padding: 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  /* width: calc(100vw - 90px); */
  /* box-shadow: -1px 1px 5px 1px rgba(0, 0, 0, 0.1); */
  @media (max-width: 768px) {
    flex-direction: column;
    /* width: calc(100vw - 30px)!important; */
    margin-bottom: 40px;
    padding: 0px;
  }
`;

export const SubContainerTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
  text-align: left;
  margin-left: 20px;
  @media (max-width: 768px) {
    color: #bf1f7c;
    font-size: 2rem;
    width: 100%;
    text-align: center;
    margin-left: 0px;

  }  `;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  margin: 5px;
  display: flex;
  align-items: stretch;
  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }
  div {
    padding-top: 5px;
    margin-right: 5px;
  }
  p {
    display: none;
  }
  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }
  input[type='file'] {
    display: none;
  }
  .collapsible-header {
    background-color: #8e44ad;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 01rem;
    align-items: center;
    i {
      margin-right: 10px;
    }
    span {
      margin-right: 15px;
      color: white;
    }
    [type='checkbox'].filled-in:not(:checked) + span:not(.lever)::after {
      border-color: white !important;
    }

    [type='checkbox'].filled-in:disabled:checked + span:not(.lever)::after {
      background-color: #bf1f7c;
      border-color: #bf1f7c;
    }
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;
  @media (max-width: 768px) {
    padding-top: 0px;
  }
`;


export const Line = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props) => (props.loading === 1 ? 'inherit' : 'center')};
  @media (max-width: 768px) {
    flex-direction: column;
    width: calc(100vw - 35px) !important;
    align-items: center !important;
  }
`;

export const Graph = styled.div`
  display: flex;
  flex-direction: column;
  h6 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #858585;
    text-align: center;
    margin-bottom: 28px;
  }
  /* box-shadow: rgba(0,0,0,0.1) 0px 0px 2px 2px; */
  margin-right: 5px;
  padding-bottom: 10px;
  canvas{
    height: 170px!important;
    width: 360px!important;
  }
`;
export const IndicatorsLine = styled.div`
  border-left: 1px solid #ccc;
  padding: 10px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: ${(props) => (props.loading === 1 ? 'column' : 'row')};
  margin-top: 5px;
  @media (max-width: 768px) {
    display: ${(props) => (props.loading === 1 ? 'none' : 'flex')};
  }
  justify-content: flex-start;
`;
