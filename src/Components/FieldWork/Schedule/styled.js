import styled from 'styled-components'

export const LinhaRodape = styled.div`
  border: 1px solid blue;

  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  background-color: white;
  border-color: #ccc;
  border-style: solid;
  border-width: 1px 0px 0px 0px;
  margin: 20px 10px 0px 10px;
  background-color: white;
  padding-bottom: 10px;

  /* position: absolute;
  bottom: 10%;
  right: 2%;
  width: 100%; */
`
export const DivRodape = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  button:first-of-type {
    @media (max-width: 768px) {
      display: none !important;
    }
  }
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
`
