import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin-left: 64px;

  > div.contentError {
    margin: 30px 90px 0 30px;
    padding: 0 20px 15px;

    border: 7px solid #8e44ad;
    border-radius: 20px;
    h4 {
      display: flex;
      font-weight: 700;
      i {
        height: max-content;
        width: max-content;
        background: #bd207b;
        border-radius: 10px;
        color: #fff;
        margin-right: 10px;
      }
    }
    button {
      width: 100%;
    }
  }
`;

export const Linha = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  display: flex;
  /* align-items: stretch; */

  @media (max-width: 768px) {
    padding-top: 0px;
    flex-direction: column;
  }

  h6 {
    margin-top: 0px;
    margin-bottom: 0px;
    word-break: break-all;
    font-size: 13px;
    color: #525252;
    font-weight: bold;
  }

  .labelStatus {
    max-width: 70%;
    display: block !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  div.detail {
    padding: 0;
  }

  input[type='file'] {
    display: none;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /* padding-top: 5px; */
`;
