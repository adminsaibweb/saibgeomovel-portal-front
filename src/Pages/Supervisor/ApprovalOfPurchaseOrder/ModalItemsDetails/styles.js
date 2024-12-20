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
  font-size: 1.5rem;
  margin-top: -8px;
  margin-bottom: 4px;  
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export const TableOrder = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
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

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #8E44AD;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;

  > div {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    > h5 {
      font-size: 1.2rem;
      color: #fff;
      font-weight: bold;
      margin: 0.5rem 0;
    }
    > i {
      color: #fff;
      margin-right: 4px;
    }
  }

  .valueTotal {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    color: #fff;
    font-weight: bold;
    font-size: 1.2rem;
  }

  @media (max-width: 400px) {
    padding: 0.2rem;

    > div {
      > h5 {
        font-size: 0.9rem;
      }
    }

    .valueTotal {
      font-size: 0.9rem;
    }
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

export const ContainerDocuments = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.4rem;
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
  justify-content: flex-start;
  align-items: center;
  min-width: 300px;
  min-height: 260px;
  border: 1px solid #8E44AD;

  background: #fff;
  transition: all 0.2s linear;

  @media (max-width: 400px) {
    width: 180px;
    min-width: 150px;
  }
`

export const ContentCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`

export const TitleCard = styled.div`
  text-align: center;
  width: 100%;
  background: #8E44AD;

  > h2 {
    font-size: 1rem;
    margin: 0;
    color: #fff;
    padding: 0.3rem;
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
    margin-right: 2px;
  }
  > span {
    font-size: 1rem;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis; 
  }

  @media (max-width: 400px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

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
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  margin: 0.2rem 0 0.3rem 0;

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
`
