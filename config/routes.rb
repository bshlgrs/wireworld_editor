Rails.application.routes.draw do
  resources :worlds, only: [:show]

  root :to => 'main#main'

  namespace :api do
    resources :worlds, :except => [:new, :edit]
  end
end
