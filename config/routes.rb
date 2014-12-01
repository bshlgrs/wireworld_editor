Rails.application.routes.draw do
  root :to => 'main#main'

  namespace :api do
    resources :worlds, :except => [:new, :edit]
  end
end
