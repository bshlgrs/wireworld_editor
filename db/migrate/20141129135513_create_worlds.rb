class CreateWorlds < ActiveRecord::Migration
  def change
    create_table :worlds do |t|
      t.string :contents
      t.string :name
      t.string :description
      t.integer :user_id

      t.timestamps
    end
  end
end
