import styled from "styled-components"

export const TitleModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #8E44AD;
  color: #fff;
  font-weight: 500;
  font-size: 1.4rem;
  margin-top: -8px;
  > span {
    padding: 0.3rem 0;
  }
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;

  > h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #8E44AD;
    text-align: center;
  }

  .textarea {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    width: 95%;

    > label {
      font-size: 1rem;
      color: #333333;
    }
  }
`

export const ActionsModal = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;

    background: #8E44AD !important;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 500;

    border-radius: 100px;
    border: none;

    padding: 0.5rem 1rem;

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
  }

  &:hover {
      background: #fff !important;
      border-color: none !important;
    }
`

export const Textarea = styled.textarea`
  position: relative;
  resize: none;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  height: 120px;
  padding: 5px;
  border: none;
  border: 1px solid #b3b3b3;
  margin: 2px;
  color: #333333;
  box-shadow: 400;
`