import styled from "styled-components"

export const ActionsModal = styled.div`
  display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    margin: 0.3rem 0;

    > button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;

      background: #8E44AD !important;
      color: #fff;
      font-weight: 500;

      padding: 0.7rem;
      border-radius: 100px;
      border: none;

      &:hover {
        background: #8E44AD !important;
        border-color: none !important;
      }

      > i {
        &:hover {
          color: #fff !important;
          background: #8E44AD !important;
      }
      }

      @media (max-width: 330px) {
        padding: 0.5rem;
      }

      &:disabled {
        background: #ccc !important;
        color: #4d4d4d;
        cursor: default;
        > i {
          color: #4d4d4d;
          &:hover {
            color: #4d4d4d !important;
            background: none !important;
          }
        }
      }

    }

    &:hover {
      background: #fff !important;
      border-color: none !important;
    }

    @media (max-width: 330px) {
      flex-wrap: wrap;
    }
`
export const TitleModal = styled.div`
  text-align: center;
  color: #8E44AD;
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: -8px;
  margin-bottom: 4px;  
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export const DataDocument = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;

  .titleBar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    background: #8E44AD;
    padding: 0 5px;
    border-radius: 2px;

    > h5 {
      font-size: 1.1rem;
      color: #fff;
      font-weight: bold;
      margin: 0.5rem 0;
    }

    > i {
      color: #fff;
      margin-right: 3px;
    }
  }
`

export const Table = styled.table`
  margin: 0.5rem 0;

  > tbody {
    td:nth-child(1) {
      font-weight: 500;
      color: #000;
    }
    td:nth-child(2) {
      color: #404040;
      font-weight: 500;
    }
  }
`

export const ObservationActionDocument = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  
  width: 100%;
  
  margin: 0 0.2rem 0.2rem;

  > label {
    font-size: 0.9rem;
    color: #333333;
    font-weight: 500;
  }

  > textarea {
    position: relative;
    resize: none;
    height: 40px;
    padding: 5px;
    border: none;
    width: 80%;
    border: 1px solid #b3b3b3;
    margin: 2px;
    color: #333333;
    box-shadow: 400;
    font-size: 0.9rem;
  }
`

export const LabelDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  
  width: 100%;
  
  margin: 0 0.2rem 0.2rem;
  > h5 {
    font-size: 1.2rem;
    color: #000;
    font-weight: bold;
    margin: 0;
  }

  > span {
    font-size: 1.2rem;
    color: #000;
    font-weight: bold;
    padding: 0.3rem 0.5rem;

    border: 2px solid rgba(0,0,0,0.60);
    box-shadow: 0px 8px 20px 5px rgba(148,147,147,0.25);
  }
`

export const ContainerOthersDocuments = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.3rem;
  width: 100%;
  padding-bottom: 0.3rem;
  margin-top: 0.4rem;
  overflow-x: auto;

  ::-webkit-scrollbar-thumb {    
    background: rgba(142,68,173,0.5);
  }
`

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-width: 300px;
  min-height: 315px;
  border: 1px solid #8E44AD;

  .title {
    text-align: center; 
    width: 100%;
    background: #8E44AD;

    > h2 {
      font-size: 1rem;
      margin: 0;
      color: #fff;
      padding: 0.3rem;
    }
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    margin: 0.3rem 0;

    > button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;

      background: #8E44AD;
      color: #fff;
      font-weight: 500;

      padding: 0.3rem 0.5rem;
      border-radius: 100px;
      border: none;

      @media (max-width: 475px) {
        padding: 0.2rem 0.3rem;
        gap: 0.1rem;
      }
    }

    @media (max-width: 475px) {
      gap: 0.2rem;
    }
  }

  @media (max-width: 340px) {
    width: 155px;
    min-width: 150px;
  }
`

export const TextArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 95%;

  > label {
    font-size: 0.9rem;
    color: #333333;
    font-weight: 500;
  }

  > textarea {
    position: relative;
    resize: none;
    width: 90%;
    min-width: 90%;
    height: 40px;
    padding: 5px;
    border: none;
    border: 1px solid #b3b3b3;
    margin: 2px;
    color: #333333;
    box-shadow: 400;
    font-size: 0.9rem;
  }

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin: 0.3rem 0;

    background: #d50000;
    color: #fff;
    font-weight: 500;

    padding: 0.3rem 0.5rem;
    border-radius: 100px;
    border: none;
    transition: all 0.2s linear;

    &:hover {
      background: #c70000;
    }
  }
`

export const LabelItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 2px;
  padding: 0 0.3rem;

  > strong {
    font-weight: bold;
    font-size: 1rem;
    margin-right: 3px;
  }

  > span {
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; 
    color: #000;
  }

  @media (max-width: 340px) {
    flex-direction: column;
    align-items: flex-start;

    > strong {
      font-size: 0.9rem;
    }

    > span {
      font-size: 0.9rem;
      white-space: nowrap; 
      overflow: hidden;
      width: 130px;
      text-overflow: ellipsis; 
    }
  }
`

export const ObservationAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 0.3rem;

  > div {
    > label {
      font-size: 0.9rem;
      color: #333333;
      font-weight: 500;
    }

    > textarea {
      position: relative;
      resize: none;
      height: 40px;
      padding: 5px;
      border: none;
      border: 1px solid #b3b3b3;
      margin: 2px;
      color: #333333;
      box-shadow: 400;
      font-size: 0.9rem;
    }
  }

  .approved {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    margin: 0.1rem 0 0.3rem 0;

    background: #00c853;
    border: none;
    border-radius: 100px;
    padding: 0.3rem 0.5rem;
    color: #fff;
    font-weight: 500;
  }

  .denied {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    margin: 0.1rem 0 0.3rem 0;

    background: #d50000;
    border: none;
    border-radius: 100px;
    padding: 0.3rem 0.5rem;
    color: #fff;
    font-weight: 500;
  }
`