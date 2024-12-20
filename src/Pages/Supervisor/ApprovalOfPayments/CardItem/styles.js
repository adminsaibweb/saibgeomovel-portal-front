import styled from "styled-components"

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92%;
  max-width: 300px;
  padding: 0.5rem 0.7rem;

  border-radius: 10px;
  box-shadow: 0px 0px 4px 2px #ccc;

  > span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    margin: 0.3rem 0;
    text-align: center;
    color: #8E44AD;
    font-weight: bold;
    font-size: 20px;

    > strong {
      color: #000;
      font-weight: bold;
    font-size: 20px;

    }
  }

  .partiallyPay {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    margin: 0.1rem 0;
    text-align: center;
    font-weight: bold;
    font-size: 0.9rem;
    color: #4298E8;

    > strong {
      color: #000;
      font-weight: bold;
    font-size: 0.9rem;

    }
  }
`

export const Details = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  width: 100%;
`

export const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;

  > div {
    margin-bottom: 0.6rem;
    > h5 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #404040;
    }

    > span {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #000;
    }

    .name {
      color: #08703E;
    }
  }
`

export const ColumnRight = styled.div`
  display: flex;
  flex-direction: column;

  > div {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0.6rem;


    > h5 {
      margin: 0;
      font-size: 1rem;      
      font-weight: 500;
      color: #404040;
    }

    > span {
      text-align: right;
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #000;
    }
    .name {
      color: #08703E;
    }
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10%;

  width: 95%;
  margin: 0.7rem 0;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50px;
    padding: 0.3rem 1rem;
  
    border: 2px solid #8E44AD;
    box-shadow: 0px 4px 10px 1px rgba(142,68,173,0.25);
    background: #fff;
    color: #8E44AD;
    font-weight: bold;
    font-size: 1rem;

    > i {
      margin-right: 0.2rem;
    }

    transition: all 0.2s linear;

    &:hover {
      background: rgba(142,68,173,0.15);
    }
  }
`

export const ActionsWaitApproved = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3%;

  width: 100%;
  margin: 0.7rem 0;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50px;
    padding: 0.3rem 0.5rem;
  
    border: 2px solid #8E44AD;
    box-shadow: 0px 4px 10px 1px rgba(142,68,173,0.25);
    background: #fff;
    color: #8E44AD;
    font-weight: bold;
    font-size: 1rem;

    > i {
      margin-right: 0.1rem;
    }

    transition: all 0.2s linear;

    &:hover {
      background: rgba(142,68,173,0.15);
    }
  }
`